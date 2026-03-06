import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class MeService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrders(userId: string) {
    const list = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        plan: true,
        checkQuota: true,
        stripeSessionId: true,
        createdAt: true,
      },
    });
    return {
      orders: list.map((o) => ({
        id: o.id,
        plan: o.plan,
        credits: o.checkQuota,
        stripeSessionId: o.stripeSessionId,
        createdAt: o.createdAt.toISOString(),
      })),
    };
  }

  async getCreditHistory(userId: string) {
    const [orders, reports] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, plan: true, checkQuota: true, createdAt: true },
      }),
      this.prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          fileName: true,
          creditsUsed: true,
          rawText: true,
          createdAt: true,
        },
      }),
    ]);

    const entries: Array<{
      id: string;
      type: "purchase" | "check";
      amount: number;
      charCount?: number;
      creditsUsed?: number;
      fileName?: string;
      plan?: string;
      createdAt: string;
    }> = [];

    for (const o of orders) {
      entries.push({
        id: o.id,
        type: "purchase",
        amount: o.checkQuota,
        plan: o.plan,
        createdAt: o.createdAt.toISOString(),
      });
    }
    for (const r of reports) {
      const charCount = r.rawText?.length ?? 0;
      entries.push({
        id: r.id,
        type: "check",
        amount: -(r.creditsUsed ?? 0),
        charCount,
        creditsUsed: r.creditsUsed ?? 0,
        fileName: r.fileName,
        createdAt: r.createdAt.toISOString(),
      });
    }

    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { history: entries.slice(0, 200) };
  }
}
