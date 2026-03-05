import { Module } from "@nestjs/common";
import { PrismaModule } from "../../common/prisma/prisma.module";
import { StorageModule } from "../storage/storage.module";
import { HumanReviewService } from "./human-review.service";
import { HumanReviewController } from "./human-review.controller";

@Module({
  imports: [PrismaModule, StorageModule],
  providers: [HumanReviewService],
  controllers: [HumanReviewController],
})
export class HumanReviewModule {}

