import { HttpService } from "@nestjs/axios";
import { BadGatewayException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

export type SegmentDetection = {
  text: string;
  aiProbability: number;
  riskLevel: "low" | "medium" | "high";
  explanation: string;
};

@Injectable()
export class GptZeroService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async detect(segments: string[]) {
    const baseUrl = this.configService.getOrThrow<string>("GPTZERO_BASE_URL");
    const endpoint = this.configService.get<string>("GPTZERO_ENDPOINT", "/v2/predict/text");
    const apiKey = this.configService.getOrThrow<string>("GPTZERO_API_KEY");

    try {
      const document = segments.join("\n\n");

      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}${endpoint}`,
          {
            document,
            // 可选：版本标记，兼容官方最新文档
            // version: "v2",
          },
          {
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        ),
      );

      const data = response.data as any;

      // 根据最新文档，优先读取文档级概率；字段名做多种兼容
      const overallScore: number =
        data?.document?.overall_generated_prob ??
        data?.overall_generated_prob ??
        data?.document_score ??
        data?.average_generated_prob ??
        0.5;

      // 目前按文档级结果均匀分配到各段，后续如需可根据 GPTZero 返回的更细粒度结果再精细拆分
      const results: SegmentDetection[] = segments.map((text) => {
        const score = overallScore;
        return {
          text,
          aiProbability: score,
          riskLevel: score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low",
          explanation:
            score >= 0.7
              ? "Strong AI writing indicators detected."
              : score >= 0.4
                ? "Some AI writing patterns are present."
                : "Human-like writing signals are stronger.",
        };
      });

      return {
        overallScore,
        segments: results,
        rawResponse: data,
      };
    } catch (error) {
      const anyErr = error as any;
      // eslint-disable-next-line no-console
      console.error("GptZeroService.detect error", {
        message: anyErr?.message,
        status: anyErr?.response?.status,
        data: anyErr?.response?.data,
      });
      throw new BadGatewayException("GPTZero API request failed");
    }
  }
}

