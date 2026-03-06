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

/** GPTZero /v2/predict/text 文档结构（按官方 DocumentPredictions） */
type GptZeroDoc = {
  paragraphs?: Array<{ completely_generated_prob?: number; start_sentence_index?: number; num_sentences?: number }>;
  sentences?: unknown[];
  average_generated_prob?: number;
  completely_generated_prob?: number;
  overall_burstiness?: number;
  document_classification?: string;
  result_message?: string;
  result_sub_message?: string;
};

/** Bibliography scan 返回（结构以 GPTZero 实际为准，先泛型存储） */
export type BibliographyScanResult = Record<string, unknown> | null;

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
          { document },
          {
            headers: {
              "x-api-key": apiKey,
              "Content-Type": "application/json",
            },
            timeout: 20000,
          },
        ),
      );

      const data = response.data as {
        documents?: GptZeroDoc[];
        document?: GptZeroDoc;
        version?: string;
      };

      const doc: GptZeroDoc | undefined = data?.documents?.[0] ?? data?.document;
      const overallScore: number =
        doc?.average_generated_prob ??
        doc?.completely_generated_prob ??
        (data as any)?.overall_generated_prob ??
        (data as any)?.document_score ??
        0.5;

      const paragraphProbs: number[] =
        doc?.paragraphs?.map((p) => p.completely_generated_prob ?? overallScore) ?? [];

      const results: SegmentDetection[] = segments.map((text, index) => {
        const score = index < paragraphProbs.length ? paragraphProbs[index]! : overallScore;
        const riskLevel: "low" | "medium" | "high" = score >= 0.7 ? "high" : score >= 0.4 ? "medium" : "low";
        const explanation =
          score >= 0.7
            ? "Strong AI writing indicators detected."
            : score >= 0.4
              ? "Some AI writing patterns are present."
              : "Human-like writing signals are stronger.";
        return {
          text,
          aiProbability: score,
          riskLevel,
          explanation,
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

  /**
   * 抄袭/文献扫描：POST https://api.gptzero.me/v2/bibliography-scan/text
   * body: { document: "全文" }
   */
  async scanBibliography(document: string): Promise<BibliographyScanResult> {
    const baseUrl = this.configService.getOrThrow<string>("GPTZERO_BASE_URL");
    const endpoint = "/v2/bibliography-scan/text";
    const apiKey = this.configService.getOrThrow<string>("GPTZERO_API_KEY");

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${baseUrl}${endpoint}`,
          { document },
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            timeout: 30000,
          },
        ),
      );
      return (response.data as Record<string, unknown>) ?? null;
    } catch (error) {
      const anyErr = error as any;
      // eslint-disable-next-line no-console
      console.error("GptZeroService.scanBibliography error", {
        message: anyErr?.message,
        status: anyErr?.response?.status,
        data: anyErr?.response?.data,
      });
      return null;
    }
  }
}
