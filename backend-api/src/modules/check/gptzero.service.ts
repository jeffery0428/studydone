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
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}${endpoint}`,
          { paragraphs: segments },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        ),
      );

      const data = response.data as {
        document_score?: number;
        average_generated_prob?: number;
        paragraphs?: Array<{
          generated_prob?: number;
          score?: number;
          explanation?: string;
        }>;
      };

      const results: SegmentDetection[] = segments.map((text, index) => {
        const score =
          data.paragraphs?.[index]?.generated_prob ??
          data.paragraphs?.[index]?.score ??
          data.average_generated_prob ??
          0.5;
        return {
          text,
          aiProbability: score,
          riskLevel: score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low",
          explanation:
            data.paragraphs?.[index]?.explanation ||
            (score >= 0.7
              ? "Strong AI writing indicators detected."
              : score >= 0.4
                ? "Some AI writing patterns are present."
                : "Human-like writing signals are stronger."),
        };
      });

      const overallScore =
        data.document_score ??
        data.average_generated_prob ??
        results.reduce((sum, item) => sum + item.aiProbability, 0) / Math.max(results.length, 1);

      return {
        overallScore,
        segments: results,
        rawResponse: data,
      };
    } catch (error) {
      throw new BadGatewayException("GPTZero API request failed");
    }
  }
}

