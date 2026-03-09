import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class StripeService {
  private readonly stripe: Stripe | null;
  private readonly webhookSecret?: string;
  private readonly frontendAppUrl: string;
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const secretKey = this.configService.get<string>("STRIPE_SECRET_KEY");
    this.stripe = secretKey ? new Stripe(secretKey) : null;
    this.webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    this.isProduction = this.configService.get<string>("NODE_ENV") === "production";
    this.frontendAppUrl =
      this.configService.get<string>("FRONTEND_APP_URL") ||
      this.configService.get<string>("FRONTEND_ORIGIN", "http://localhost:3000");
  }

  async createCheckout(userId: string, plan: string) {
    if (!this.stripe) {
      throw new InternalServerErrorException("Stripe is not configured");
    }

    const plans: Record<string, { priceId?: string; quota: number; amount: number; name: string }> = {
      "5": {
        priceId: this.configService.get<string>("STRIPE_PRICE_5"),
        quota: 250,
        amount: 500,
        name: "StudyDone Base",
      },
      "50": {
        priceId: this.configService.get<string>("STRIPE_PRICE_50"),
        quota: 2500,
        amount: 4800,
        name: "StudyDone Pro",
      },
      "200": {
        priceId: this.configService.get<string>("STRIPE_PRICE_200"),
        quota: 10000,
        amount: 19500,
        name: "StudyDone Teacher",
      },
    };

    const selected = plans[plan];
    if (!selected) {
      throw new BadRequestException("Invalid plan");
    }

    if (this.isProduction && !selected.priceId) {
      throw new InternalServerErrorException("Stripe price is required in production");
    }

    const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = selected.priceId
      ? { price: selected.priceId, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${selected.name} (${selected.quota} checks)`,
            },
            unit_amount: selected.amount,
          },
          quantity: 1,
        };

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [lineItem],
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

