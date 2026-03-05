/**
 * AI 痕迹检测逻辑
 * 实际生产环境可接入 OpenAI / 第三方 API
 * 此处使用基于文本特征的模拟算法
 */

export type SegmentResult = {
  text: string;
  aiProbability: number;
  riskLevel: "low" | "medium" | "high";
  explanation: string;
};

export type DetectionResult = {
  overallScore: number;
  segments: SegmentResult[];
};

// 常见 AI 生成文本特征词/模式
const AI_INDICATORS = [
  "综上所述", "值得注意的是", "总而言之", "首先", "其次", "最后",
  "Furthermore", "Moreover", "Additionally", "In conclusion",
  "It is important to note", "It should be noted", "delve into",
  "comprehensive", "nuanced", "leverage", "robust", "seamlessly",
  "dive deep", "navigate", "landscape", "realm", "tapestry",
];

function calculateSegmentScore(text: string): number {
  let score = 0.5;
  const lower = text.toLowerCase();

  AI_INDICATORS.forEach((ind) => {
    if (lower.includes(ind.toLowerCase())) score += 0.08;
  });

  const sentenceCount = (text.match(/[。.!?]/g) || []).length;
  const avgLen = text.length / Math.max(sentenceCount, 1);
  if (avgLen > 80 && avgLen < 120) score += 0.1;
  if (sentenceCount > 0 && text.length / sentenceCount > 100) score += 0.05;

  const repetitive = /(\b\w+\b).*\1.*\1/.test(text);
  if (repetitive) score += 0.1;

  return Math.min(0.95, Math.max(0.05, score + (Math.random() - 0.5) * 0.15));
}

function getRiskLevel(score: number): "low" | "medium" | "high" {
  if (score < 0.4) return "low";
  if (score < 0.7) return "medium";
  return "high";
}

function getExplanation(score: number, riskLevel: string): string {
  const explanations: Record<string, string[]> = {
    low: [
      "该段落表现出较强的人类写作特征，句式多样，用词自然。",
      "文本风格自然，无明显 AI 生成痕迹。",
    ],
    medium: [
      "部分表达较为模板化，建议适当改写以增强原创性。",
      "存在一些常见 AI 写作模式，可考虑增加个人化表达。",
    ],
    high: [
      "该段落具有明显的 AI 生成特征，建议大幅改写或重写。",
      "检测到较多 AI 常用表达，强烈建议人工润色。",
    ],
  };
  const list = explanations[riskLevel] || explanations.medium;
  return list[Math.floor(Math.random() * list.length)];
}

export function analyzeText(segments: string[]): DetectionResult {
  const segmentResults: SegmentResult[] = segments.map((text) => {
    const aiProbability = calculateSegmentScore(text);
    const riskLevel = getRiskLevel(aiProbability);
    return {
      text,
      aiProbability,
      riskLevel,
      explanation: getExplanation(aiProbability, riskLevel),
    };
  });

  const overallScore =
    segmentResults.length > 0
      ? segmentResults.reduce((s, r) => s + r.aiProbability, 0) / segmentResults.length
      : 0.5;

  return {
    overallScore: Math.round(overallScore * 100) / 100,
    segments: segmentResults,
  };
}
