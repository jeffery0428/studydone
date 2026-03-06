import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import {
  CurrentUser,
  type CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";
import { CheckService } from "./check.service";

@Controller("check")
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor("file"))
  runCheck(
    @CurrentUser() user: CurrentUserPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body("aiDetection") aiDetection?: string,
    @Body("plagiarismDetection") plagiarismDetection?: string,
  ) {
    const options = {
      aiDetection: aiDetection !== "false" && aiDetection !== "0",
      plagiarismDetection: plagiarismDetection !== "false" && plagiarismDetection !== "0",
    };
    return this.checkService.runCheck(user.userId, file, options);
  }
}

