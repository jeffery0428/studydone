import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OSS from "ali-oss";
import { randomUUID } from "crypto";

@Injectable()
export class OssService {
  private readonly client: OSS;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>("ALIYUN_OSS_BUCKET");
    const accessKeyId = this.configService.getOrThrow<string>("ALIYUN_OSS_ACCESS_KEY_ID");
    const accessKeySecret =
      this.configService.getOrThrow<string>("ALIYUN_OSS_ACCESS_KEY_SECRET");
    const region = this.configService.getOrThrow<string>("ALIYUN_OSS_REGION");

    this.client = new OSS({
      region,
      accessKeyId,
      accessKeySecret,
      bucket: this.bucket,
    });
  }

  async uploadFile(params: {
    userId: string;
    fileName: string;
    buffer: Buffer;
    contentType: string;
  }) {
    const ext = params.fileName.includes(".")
      ? params.fileName.slice(params.fileName.lastIndexOf("."))
      : "";
    const key = `${params.userId}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${ext}`;

    await this.client.put(key, params.buffer, {
      headers: {
        "Content-Type": params.contentType,
      },
    });

    return {
      key,
    };
  }
}

