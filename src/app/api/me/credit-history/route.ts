import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [orders, reports] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, plan: true, checkQuota: true, createdAt: true },
    }),
    prisma.report.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, rawText: true, createdAt: true },
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
    const creditsUsed = Math.max(1, Math.ceil(charCount / 100));
    entries.push({
      id: r.id,
      type: "check",
      amount: -creditsUsed,
      charCount,
      creditsUsed,
      fileName: r.fileName,
      createdAt: r.createdAt.toISOString(),
    });
  }

  entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ history: entries.slice(0, 200) });
}
