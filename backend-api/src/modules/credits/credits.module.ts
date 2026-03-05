import { Module } from "@nestjs/common";
import { CreditsService } from "./credits.service";

@Module({
  providers: [CreditsService],
})
export class CreditsModule {}

