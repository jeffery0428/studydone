import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // 每分钟清理一次超时预扣，避免僵尸冻结额度
  @Cron(CronExpression.EVERY_MINUTE)
  async clearExpiredReservations() {
    const now = new Date();
    const result = await this.prisma.creditReservation.updateMany({
      where: {
        status: "reserved",
        expiresAt: { lt: now },
      },
      data: { status: "cancelled" },
    });

    if (result.count > 0) {
      this.logger.log(`Cancelled ${result.count} expired credit reservations`);
    }
  }
}

