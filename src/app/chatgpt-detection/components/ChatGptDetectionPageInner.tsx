"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export function ChatGptDetectionPageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "检测论文中的 ChatGPT 痕迹"
      : locale === "ja"
        ? "論文内の ChatGPT らしさを検出"
        : "Detect ChatGPT Writing in Papers";

  const intro =
    locale === "zh"
      ? "StudyDone 提供面向段落的 ChatGPT / AI 论文检测，可以看到哪几段最像 AI 写的、整体 AI 率如何，方便你针对性改写。"
      : locale === "ja"
        ? "StudyDone は、段落ごとに AI 確率を推定し、どの部分が ChatGPT らしいかを可視化します。"
        : "StudyDone helps you detect ChatGPT writing in papers by estimating AI probability paragraph by paragraph instead of giving a single black‑box score.";

  const ctaPrimary =
    locale === "zh"
      ? "立即运行一次 ChatGPT 检测"
      : locale === "ja"
        ? "ChatGPT 検出を実行する"
        : "Run a ChatGPT detection check";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const whyTitle =
    locale === "zh"
      ? "为什么要在提交前检测 ChatGPT 痕迹？"
      : locale === "ja"
        ? "提出前に ChatGPT 痕跡を確認する理由"
        : "Why detect ChatGPT writing before submission?";

  const whyItems =
    locale === "zh"
      ? [
          "很多学校允许“轻度 AI 辅助”，但禁止整篇由 ChatGPT 生成的论文。",
          "段落级别的风险提示，帮助你只改写 AI 痕迹最重的部分，而不是整篇推倒重写。",
          "适用于课程论文、个人陈述、毕业论文章节等高风险文本。",
        ]
      : locale === "ja"
        ? [
            "多くの大学では「軽い AI 補助」は許可されますが、全文を ChatGPT で生成することは禁じられています。",
            "段落ごとのリスク表示により、特に AI 依存度の高い部分だけを重点的に書き換えできます。",
            "レポート、パーソナルステートメント、卒論の一章などに最適です。",
          ]
        : [
            "Many AI policies allow “light assistance” but forbid fully generated essays.",
            "Paragraph‑level risk helps you rewrite AI‑heavy blocks into more authentic writing.",
            "Works well for personal statements, coursework essays and thesis chapters.",
          ];

  const formatTitle =
    locale === "zh"
      ? "支持的文件格式"
      : locale === "ja"
        ? "対応フォーマット"
        : "Supported formats";

  const formatText =
    locale === "zh"
      ? "支持上传 Word（.docx）、PDF 和纯文本（.txt），使用与你最终提交完全相同的文件进行检测。"
      : locale === "ja"
        ? "Word（.docx）、PDF、テキスト（.txt）ファイルに対応しており、最終提出と同じファイルで検出できます。"
        : "Upload Word (.docx), PDF or plain text (.txt) and get a detailed AI detection report with explanations.";

  const formatSub =
    locale === "zh"
      ? "推荐在最终提交前，用 StudyDone 做一次“ChatGPT 痕迹体检”，再针对高风险段落逐段调整。"
      : locale === "ja"
        ? "最終提出前に StudyDone で一度チェックし、リスクの高い段落を中心に書き直すことをおすすめします。"
        : "We recommend running a ChatGPT check before submission and then revising only the highest‑risk paragraphs.";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
          >
            {ctaPrimary}
          </Link>
          <Link
            href="/pricing"
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:bg-slate-800/60"
          >
            {ctaSecondary}
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{whyTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {whyItems.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{formatTitle}</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{formatText}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{formatSub}</p>
        </div>
      </section>
    </div>
  );
}

