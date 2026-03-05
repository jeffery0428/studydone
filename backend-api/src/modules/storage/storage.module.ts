import { Module } from "@nestjs/common";
import { R2Service } from "./r2.service";
import { OssService } from "./oss.service";

@Module({
  providers: [R2Service, OssService],
  exports: [R2Service, OssService],
})
export class StorageModule {}

