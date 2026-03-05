import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  ForbiddenException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { HumanReviewService } from "./human-review.service";

@Controller("human-review")
export class HumanReviewController {
  constructor(private readonly humanReviewService: HumanReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  async createRequest(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.humanReviewService.requestReview(user.userId, file);
    return {
      message: "Human review request created",
      ...result,
    };
  }

  @Get("admin/requests")
  @UseGuards(JwtAuthGuard)
  async listRequests(
    @CurrentUser() user: CurrentUserPayload,
    @Query("status") status?: "pending" | "in_progress" | "completed" | "cancelled",
    @Query("skip") skip?: string,
    @Query("take") take?: string,
  ) {
    if (user.role !== "teacher") {
      throw new ForbiddenException("Only teacher accounts can manage human review requests");
    }

    const skipNum = skip ? Number(skip) : 0;
    const takeNum = take ? Number(take) : 50;

    return this.humanReviewService.listRequests({
      status,
      skip: Number.isNaN(skipNum) ? 0 : skipNum,
      take: Number.isNaN(takeNum) ? 50 : takeNum,
    });
  }

  @Patch("admin/requests/:id/status")
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @CurrentUser() user: CurrentUserPayload,
    @Param("id") id: string,
    @Body("status") status: "pending" | "in_progress" | "completed" | "cancelled",
  ) {
    if (user.role !== "teacher") {
      throw new ForbiddenException("Only teacher accounts can manage human review requests");
    }

    const updated = await this.humanReviewService.updateStatus(id, status);
    return {
      message: "Human review status updated",
      ...updated,
    };
  }
}

