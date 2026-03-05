import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { StripeService } from "./stripe.service";

@Controller("stripe")
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post("checkout")
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @CurrentUser() user: CurrentUserPayload,
    @Body("plan") plan: string,
  ) {
    return this.stripeService.createCheckout(user.userId, plan);
  }

  @Post("webhook")
  webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature?: string,
  ) {
    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException("Missing raw body for Stripe webhook");
    }
    return this.stripeService.handleWebhook(rawBody, signature);
  }
}

