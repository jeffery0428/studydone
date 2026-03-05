import { HttpService } from "@nestjs/axios";
import { BadGatewayException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import type { SegmentDetection } from "./gptzero.service";

@Injectable()
export class OriginalityAiService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async detect(segments: string[]) {
    const apiKey = this.configService.get<string>("ORIGINALITY_API_KEY");
    const baseUrl = this.configService.get<string>("ORIGINALITY_BASE_URL");
    const endpoint = this.configService.get<string>("ORIGINALITY_ENDPOINT");

    if (!apiKey || !baseUrl || !endpoint) {
      throw new InternalServerErrorException("Originality.ai is not configured");
    }

    const fullText = segments.join("\n\n");

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}${endpoint}`,
          {
            text: fullText,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        ),
      );

      const data = response.data as any;

      // 这里根据真实 Originality.ai 返回结构做适配
      const overallScore: number =
        data?.overallScore ??
        data?.score ??
        data?.aiPercent ??
        0.5;

      const results: SegmentDetection[] = segments.map((text) => {
        const score = overallScore;
        return {
          text,
          aiProbability: score,
          riskLevel: score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low",
          explanation:
            data?.explanation ||
            (score >= 0.7
              ? "Originality.ai reported strong AI indicators for this document."
              : score >= 0.4
                ? "Originality.ai reported some AI-like patterns."
                : "Originality.ai reported mostly human-like writing."),
        };
      });

      return {
        overallScore,
        segments: results,
        rawResponse: data,
      };
    } catch (error) {
      throw new BadGatewayException("Originality.ai API request failed");
    }
  }
}

