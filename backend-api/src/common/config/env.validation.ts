import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().default("4000"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),

  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),

  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
  R2_ENDPOINT: z.string().url(),
  R2_PUBLIC_BASE_URL: z.string().optional(),

  // 阿里云 OSS，用于人工复查文件存储
  ALIYUN_OSS_ACCESS_KEY_ID: z.string().min(1),
  ALIYUN_OSS_ACCESS_KEY_SECRET: z.string().min(1),
  ALIYUN_OSS_BUCKET: z.string().min(1),
  ALIYUN_OSS_REGION: z.string().min(1),

  // GPTZero 配置（当前生效）
  GPTZERO_API_KEY: z.string().min(1),
  GPTZERO_BASE_URL: z.string().url().default("https://api.gptzero.me"),
  GPTZERO_ENDPOINT: z.string().default("/v2/predict/text"),

  // Originality.ai 配置（可选备用）
  ORIGINALITY_API_KEY: z.string().optional(),
  ORIGINALITY_BASE_URL: z.string().url().default("https://api.originality.ai"),
  ORIGINALITY_ENDPOINT: z.string().default("/api/v1/scan"),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_5: z.string().optional(),
  STRIPE_PRICE_50: z.string().optional(),
  STRIPE_PRICE_200: z.string().optional(),
  FRONTEND_APP_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Invalid environment variables: ${result.error.message}`);
  }
  return result.data;
}

