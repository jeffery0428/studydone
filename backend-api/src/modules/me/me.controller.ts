import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser, type CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { MeService } from "./me.service";

@Controller("me")
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get("orders")
  orders(@CurrentUser() user: CurrentUserPayload) {
    return this.meService.getOrders(user.userId);
  }

  @Get("credit-history")
  creditHistory(@CurrentUser() user: CurrentUserPayload) {
    return this.meService.getCreditHistory(user.userId);
  }
}
