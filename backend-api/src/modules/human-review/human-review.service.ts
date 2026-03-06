import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { OssService } from "../storage/oss.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createHash } from "crypto";
import * as mammoth from "mammoth";
import * as pdf from "pdf-parse";

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/plain",
];

@Injectable()
export class HumanReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ossService: OssService,
  ) {}

  async requestReview(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Please upload a file");
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Only docx/pdf/txt are supported");
    }

    try {
      const extractedText = await this.extractText(file.buffer, file.mimetype);
      const length = extractedText.length;
      if (length === 0) {
        throw new BadRequestException("Document content is empty");
      }

      // 人工复查：50 积分起；少于 3000 字按 50 扣；≥3000 字 = 50 + 超出部分每 100 字 1 积分
      const amount = length < 3000 ? 50 : 50 + Math.ceil((length - 3000) / 100);

      const taskId = this.computeTaskId(userId, file);
      const reservation = await this.reserveCredits(userId, amount, taskId);

      const uploaded = await this.ossService.uploadFile({
        userId,
        fileName: file.originalname,
        buffer: file.buffer,
        contentType: file.mimetype,
      });

      const created = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.creditReservation.updateMany({
          where: {
            id: reservation.id,
            userId,
            status: "reserved",
          },
          data: { status: "committed" },
        });
        if (updated.count !== 1) {
          throw new BadRequestException("Reservation not available");
        }

        await tx.user.update({
          where: { id: userId },
          data: { checkQuota: { decrement: reservation.amount } },
        });

        return (tx as any).humanReviewRequest.create({
          data: {
            userId,
            fileName: file.originalname,
            fileType: file.mimetype,
            ossObjectKey: uploaded.key,
            charCount: length,
            creditsUsed: reservation.amount,
            status: "pending",
          },
        });
      });

      const userAfter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { checkQuota: true },
      });

      return {
        requestId: created.id,
        charCount: created.charCount,
        creditsUsed: created.creditsUsed,
        remainingQuota: userAfter?.checkQuota ?? 0,
      };
    } catch (error) {
      // 记录详细错误日志，便于线上排查
      // eslint-disable-next-line no-console
      console.error("HumanReviewService.requestReview error", {
        userId,
        fileName: file?.originalname,
        message: (error as any)?.message,
        stack: (error as any)?.stack,
      });

      // 如果在预扣之后出错，回滚预扣
      await this.prisma.creditReservation.updateMany({
        where: {
          userId,
          status: "reserved",
        },
        data: { status: "cancelled" },
      });
      throw error;
    }
  }

  private async reserveCredits(userId: string, amount: number, taskId: string) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    return this.prisma.$transaction(async (tx) => {
      const userRows = await tx.$queryRaw<Array<{ checkQuota: number }>>`
        SELECT \`checkQuota\`
        FROM \`User\`
        WHERE \`id\` = ${userId}
        FOR UPDATE
      `;
      const user = userRows[0];
      if (!user) throw new BadRequestException("User not found");

      await tx.creditReservation.updateMany({
        where: {
          userId,
          status: "reserved",
          expiresAt: { lt: now },
        },
        data: { status: "cancelled" },
      });

      const activeReserved = await tx.creditReservation.aggregate({
        where: {
          userId,
          status: "reserved",
          expiresAt: { gt: now },
        },
        _sum: { amount: true },
      });
      const reservedAmount = activeReserved._sum.amount ?? 0;
      const availableQuota = user.checkQuota - reservedAmount;

      if (availableQuota < amount) {
        throw new HttpException("No quota remaining", HttpStatus.PAYMENT_REQUIRED);
      }

      try {
        return await tx.creditReservation.create({
          data: {
            userId,
            amount,
            status: "reserved",
            taskId,
            expiresAt,
          },
        });
      } catch (err) {
        if (err instanceof PrismaClientKnownRequestError && err.code === "P2002") {
          throw new BadRequestException(
            "A similar human review request is already queued or has recently finished.",
          );
        }
        throw err;
      }
    });
  }

  private computeTaskId(userId: string, file: Express.Multer.File): string {
    const h = createHash("sha256");
    h.update("human-review:");
    h.update(userId);
    h.update(":");
    h.update(file.originalname || "");
    h.update(":");
    h.update(String(file.size ?? 0));
    return h.digest("hex");
  }

  private async extractText(buffer: Buffer, mimeType: string) {
    if (mimeType === "application/pdf") {
      const data = await pdf(buffer as any);
      return data.text.trim();
    }
    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const data = await mammoth.extractRawText({ buffer });
      return data.value.trim();
    }
    return buffer.toString("utf-8").trim();
  }

  async listRequests(params: {
    status?: "pending" | "in_progress" | "completed" | "cancelled";
    skip?: number;
    take?: number;
  }) {
    const { status, skip = 0, take = 50 } = params;
    return (this.prisma as any).humanReviewRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      skip,
      take,
      select: {
        id: true,
        userId: true,
        fileName: true,
        fileType: true,
        ossObjectKey: true,
        charCount: true,
        creditsUsed: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    });
  }

  async updateStatus(id: string, status: "pending" | "in_progress" | "completed" | "cancelled") {
    const now = new Date();
    const data: any = { status };
    if (status === "completed") {
      data.completedAt = now;
    }
    return (this.prisma as any).humanReviewRequest.update({
      where: { id },
      data,
      select: {
        id: true,
        status: true,
        completedAt: true,
      },
    });
  }
}

