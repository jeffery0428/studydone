"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/client-auth";

type State =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; charCount: number; creditsUsed: number; remainingQuota: number }
  | { status: "error"; message: string };

export default function HumanReviewPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<State>({ status: "idle" });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!getAccessToken()) {
      router.push("/login");
      return;
    }

    if (!file) {
      setState({ status: "error", message: "请先选择文件" });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setState({ status: "submitting" });
      const res = await apiFetch("/api/human-review", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "提交失败");
      }

      const data = await res.json();
      setState({
        status: "success",
        charCount: data.charCount,
        creditsUsed: data.creditsUsed,
        remainingQuota: data.remainingQuota,
      });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "提交失败",
      });
    }
  };

  const isSubmitting = state.status === "submitting";

  const title =
    locale === "zh"
      ? "人工复查服务"
      : locale === "ja"
        ? "人による再チェックサービス"
        : "Human review service";

  const feeRuleText =
    locale === "zh"
      ? "扣费规则：50 积分起；少于 3000 字按 50 积分扣除；大于 3000 字，超过部分按 100 字 1 积分扣除。"
      : locale === "ja"
        ? "料金：50ポイントから。3000文字未満は50ポイント、3000文字超は超過分100文字あたり1ポイント。"
        : "Fee rule: minimum 50 credits; under 3000 characters = 50 credits; over 3000 = 50 + 1 credit per 100 characters over 3000.";

  const turnitinDesc =
    locale === "zh"
      ? "使用 Turnitin 学术数据库核查。"
      : locale === "ja"
        ? "Turnitin 学術データベースで照合します。"
        : "Uses Turnitin academic database for verification.";

  const processTimeText =
    locale === "zh"
      ? "处理时间：人工核对，一般 5–30 分钟。"
      : locale === "ja"
        ? "処理時間：人の目で照合し、およそ5〜30分で結果をお送りします。"
        : "Processing time: manual review, usually 5–30 minutes.";

  const emailNoticeText =
    locale === "zh"
      ? "结果发送方式：报告结果将人工发送到您注册的邮箱，请确保邮箱可以正常接收邮件。"
      : locale === "ja"
        ? "結果の送付方法：結果レポートは登録メールアドレス宛に手動で送信します。メールを受信できる状態にしておいてください。"
        : "Delivery: the review report will be manually sent to your registered email address. Please ensure your inbox can receive emails.";

  const uploadHelpText =
    locale === "zh"
      ? "仅支持 docx / pdf / txt 文件，单个文件不超过 10MB。"
      : locale === "ja"
        ? "docx / pdf / txt ファイルのみ対応。1ファイル最大10MBまで。"
        : "Only docx / pdf / txt files are supported, up to 10 MB per file.";

  const submitLabel =
    locale === "zh"
      ? isSubmitting
        ? "提交中..."
        : "提交人工复查申请"
      : locale === "ja"
        ? isSubmitting
          ? "送信中..."
          : "人による再チェックを依頼"
        : isSubmitting
          ? "Submitting..."
          : "Submit human review request";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{turnitinDesc}</p>
      <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{feeRuleText}</p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        {processTimeText}
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
        {emailNoticeText}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 dark:border-slate-600 dark:bg-slate-900/40">
          <label className="flex cursor-pointer flex-col items-center gap-2 text-center">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {file ? file.name : uploadHelpText}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {locale === "zh"
                ? "点击选择文件，或将文件拖拽到此区域"
                : locale === "ja"
                  ? "クリックしてファイルを選択、またはここにドラッグ＆ドロップ"
                  : "Click to choose a file or drag and drop it here."}
            </span>
            <input
              type="file"
              accept=".docx,.pdf,.txt"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-70"
        >
          {submitLabel}
        </button>
      </form>

      {state.status === "success" && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100">
          <p>
            {locale === "zh"
              ? "人工复查申请已提交。"
              : locale === "ja"
                ? "人による再チェックの依頼を受け付けました。"
                : "Your human review request has been submitted."}
          </p>
          <p className="mt-1">
            {locale === "zh"
              ? `本次文档共约 ${state.charCount} 字符，已扣除 ${state.creditsUsed} 个积分。`
              : locale === "ja"
                ? `今回の文書は約 ${state.charCount} 文字で、${state.creditsUsed} ポイントを消費しました。`
                : `This document has about ${state.charCount} characters and ${state.creditsUsed} credits were used.`}
          </p>
          <p className="mt-1">
            {locale === "zh"
              ? `当前剩余积分：${state.remainingQuota}`
              : locale === "ja"
                ? `残りポイント：${state.remainingQuota}`
                : `Remaining credits: ${state.remainingQuota}`}
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-100">
          {state.message}
        </div>
      )}
    </div>
  );
}

