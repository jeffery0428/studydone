import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

// 在 Stripe Dashboard 创建产品后，将 Price ID 填入环境变量
const PLANS: Record<string, { priceId: string; quota: number }> = {
  "5": { priceId: process.env.STRIPE_PRICE_5 || "", quota: 250 },
  "50": { priceId: process.env.STRIPE_PRICE_50 || "", quota: 2500 },
  "200": { priceId: process.env.STRIPE_PRICE_200 || "", quota: 10000 },
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { plan } = await req.json();
    const config = PLANS[plan];
    if (!config || !config.priceId) {
      return NextResponse.json(
        { error: "无效套餐或 Stripe 未配置，请设置 STRIPE_PRICE_* 环境变量" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe 未配置，请设置 STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: config.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?canceled=1`,
      metadata: {
        userId: user.id,
        plan,
        quota: String(config.quota),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "创建支付失败" },
      { status: 500 }
    );
  }
}
