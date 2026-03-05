import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe 未配置，请设置 STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const quota = parseInt(session.metadata?.quota || "0", 10);

      if (userId && quota > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { checkQuota: { increment: quota } },
        });
        await prisma.subscription.create({
          data: {
            userId,
            stripeId: session.id,
            plan: session.metadata?.plan || "basic",
            checkQuota: quota,
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}
