import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const list = await prisma.subscription.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      plan: true,
      checkQuota: true,
      stripeId: true,
      createdAt: true,
    },
  });
  const orders = list.map((o) => ({
    id: o.id,
    plan: o.plan,
    credits: o.checkQuota,
    stripeSessionId: o.stripeId,
    createdAt: o.createdAt.toISOString(),
  }));
  return NextResponse.json({ orders });
}
