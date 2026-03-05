import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

@Injectable()
export class R2Service {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>("R2_BUCKET");
    this.publicBaseUrl = this.configService.get<string>("R2_PUBLIC_BASE_URL");
    this.client = new S3Client({
      region: "auto",
      endpoint: this.configService.getOrThrow<string>("R2_ENDPOINT"),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("R2_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.getOrThrow<string>("R2_SECRET_ACCESS_KEY"),
      },
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

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );

    return {
      key,
      url: this.publicBaseUrl ? `${this.publicBaseUrl}/${key}` : null,
    };
  }
}

