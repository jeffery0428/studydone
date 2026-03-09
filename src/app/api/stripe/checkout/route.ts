import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

const PLANS: Record<string, { priceId?: string; quota: number; amount: number; name: string }> = {
  "5": {
    priceId: process.env.STRIPE_PRICE_5 || undefined,
    quota: 250,
    amount: 500,
    name: "StudyDone Base",
  },
  "50": {
    priceId: process.env.STRIPE_PRICE_50 || undefined,
    quota: 2500,
    amount: 4800,
    name: "StudyDone Pro",
  },
  "200": {
    priceId: process.env.STRIPE_PRICE_200 || undefined,
    quota: 10000,
    amount: 19500,
    name: "StudyDone Teacher",
  },
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const { plan } = await req.json();
    const config = PLANS[plan];
    if (!config) {
      return NextResponse.json(
        { error: "无效套餐" },
        { status: 400 }
      );
    }

    if (isProduction() && !config.priceId) {
      return NextResponse.json(
        { error: "生产环境必须配置对应的 STRIPE_PRICE_*" },
        { status: 500 }
      );
    }

    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe 未配置，请设置 STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = config.priceId
      ? {
          price: config.priceId,
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${config.name} (${config.quota} checks)`,
            },
            unit_amount: config.amount,
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
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
