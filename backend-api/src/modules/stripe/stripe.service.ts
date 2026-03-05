import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;
  private readonly webhookSecret?: string;
  private readonly frontendAppUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    this.stripe = secretKey ? new Stripe(secretKey) : null;
    this.webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    this.frontendAppUrl =
      this.configService.get<string>("FRONTEND_APP_URL") ||
      this.configService.get<string>("FRONTEND_ORIGIN", "http://localhost:3000");
  }

  async createCheckout(userId: string, plan: string) {
    if (plan !== "5") {
      throw new BadRequestException("This plan is not open for testing yet");
    }

    if (!this.stripe) {
      throw new InternalServerErrorException("Stripe is not configured");
    }

    const plans: Record<string, { priceId?: string; quota: number }> = {
      "5": { priceId: this.configService.get<string>("STRIPE_PRICE_5"), quota: 5 },
      "50": { priceId: this.configService.get<string>("STRIPE_PRICE_50"), quota: 50 },
      "200": { priceId: this.configService.get<string>("STRIPE_PRICE_200"), quota: 200 },
    };

    const selected = plans[plan];
    if (!selected?.priceId) {
      throw new BadRequestException("Invalid plan or Stripe price is missing");
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: selected.priceId, quantity: 1 }],
      success_url: `${this.frontendAppUrl}/dashboard?success=1`,
      cancel_url: `${this.frontendAppUrl}/pricing?canceled=1`,
      metadata: {
        userId,
        plan,
        quota: String(selected.quota),
      },
    });

    return { url: session.url };
  }

  async handleWebhook(rawBody: Buffer, signature: string | undefined) {
    if (!this.stripe || !this.webhookSecret || !signature) {
      throw new BadRequestException("Stripe webhook is not configured");
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan || "custom";
      const quota = Number(session.metadata?.quota || 0);

      if (userId && quota > 0) {
        await this.prisma.$transaction([
          this.prisma.user.update({
            where: { id: userId },
            data: { checkQuota: { increment: quota } },
          }),
          this.prisma.subscription.create({
            data: {
              userId,
              stripeSessionId: session.id,
              plan,
              checkQuota: quota,
            },
          }),
        ]);
      }
    }

    return { received: true };
  }
}

