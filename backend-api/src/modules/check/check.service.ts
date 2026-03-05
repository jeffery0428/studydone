import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { R2Service } from "../storage/r2.service";
import { OriginalityAiService } from "./originality-ai.service";
import { createHash } from "crypto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import mammoth from "mammoth";
import pdf from "pdf-parse";

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/pdf",
  "text/plain",
];

@Injectable()
export class CheckService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
    private readonly originalityAiService: OriginalityAiService,
  ) {}

  async runCheck(userId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException("Please upload a file");
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException("Only docx/pdf/txt are supported");
    }

    const taskId = this.computeTaskId(userId, file);
    const reservation = await this.reserveCredits(userId, 1, taskId);

    try {
      const extractedText = await this.extractText(file.buffer, file.mimetype);
      if (extractedText.length < 50) {
        throw new BadRequestException("Document content too short for analysis");
      }

      const segments = this.segmentText(extractedText);
      const detection = await this.originalityAiService.detect(segments);

      const uploaded = await this.r2Service.uploadFile({
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

        return tx.report.create({
          data: {
            userId,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileStorageKey: uploaded.key,
            overallScore: detection.overallScore,
            rawText: extractedText.slice(0, 100000),
            segmentResults: detection.segments,
          },
        });
      });

      const userAfter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { checkQuota: true },
      });
      const remainingQuota = userAfter?.checkQuota ?? 0;

      return {
        report: {
          id: created.id,
          fileName: created.fileName,
          overallScore: created.overallScore,
          segments: detection.segments,
        },
        remainingQuota,
      };
    } catch (error) {
      await this.prisma.creditReservation.updateMany({
        where: {
          id: reservation.id,
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
            "A similar document check is already queued or has recently finished.",
          );
        }
        throw err;
      }
    });
  }

  private computeTaskId(userId: string, file: Express.Multer.File): string {
    const h = createHash("sha256");
    h.update(userId);
    h.update(":");
    h.update(file.originalname || "");
    h.update(":");
    h.update(String(file.size ?? 0));
    return h.digest("hex");
  }

  private async extractText(buffer: Buffer, mimeType: string) {
    if (mimeType === "application/pdf") {
      const data = await pdf(buffer);
      return data.text.trim();
    }
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const data = await mammoth.extractRawText({ buffer });
      return data.value.trim();
    }
    return buffer.toString("utf-8").trim();
  }

  private segmentText(text: string) {
    const paragraphs = text
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length >= 20);
    if (paragraphs.length > 0) return paragraphs;

    const chunks = text.match(/.{1,400}/g) || [text];
    return chunks.map((c) => c.trim()).filter((c) => c.length >= 20);
  }
}

