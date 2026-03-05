import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import {
  CurrentUser,
  type CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { ReportsService } from "./reports.service";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.reportsService.list(user.userId);
  }

  @Get(":id")
  detail(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.reportsService.detail(user.userId, id);
  }
}

