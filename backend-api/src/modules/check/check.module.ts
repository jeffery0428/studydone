import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { CheckController } from "./check.controller";
import { CheckService } from "./check.service";
import { GptZeroService } from "./gptzero.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [HttpModule, StorageModule],
  controllers: [CheckController],
  providers: [CheckService, GptZeroService],
})
export class CheckModule {}

