"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export function TurnitinAlternativePageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "聚焦 AI 检测的 Turnitin 替代方案"
      : locale === "ja"
        ? "AI 検出に特化した Turnitin 代替"
        : "Turnitin Alternative with AI Detection";

  const intro =
    locale === "zh"
      ? "StudyDone 并不是用来完全取代学校的查重数据库，而是作为一款聚焦 AI 检测的 Turnitin 替代工具，帮你在正式提交前先看一遍 AI 率和高风险段落。"
      : locale === "ja"
        ? "StudyDone は大学のプラグインベースの盗用データベースを完全に置き換えるものではありませんが、提出前に AI らしさを確認するための Turnitin 代替ツールとして使えます。"
        : "StudyDone is not a full replacement for institutional plagiarism databases, but it works as a Turnitin alternative focused on AI detection before you submit.";

  const ctaPrimary =
    locale === "zh"
      ? "把 StudyDone 用作 Turnitin 前置检查"
      : locale === "ja"
        ? "Turnitin 前のチェックとして試す"
        : "Try StudyDone as a Turnitin alternative";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const whenTitle =
    locale === "zh"
      ? "什么时候用 StudyDone，什么时候用 Turnitin？"
      : locale === "ja"
        ? "StudyDone と Turnitin の使い分け"
        : "When to use StudyDone vs Turnitin";

  const whenItems =
    locale === "zh"
      ? [
          "正式提交前：先用 StudyDone 看 AI 率和高风险段落，再决定是否需要重写。",
          "写作草稿阶段：快速识别“过于 AI 化”的章节。",
          "教学使用：帮助学生理解 AI 使用的边界，而不是把每一稿都送去 Turnitin。",
        ]
      : locale === "ja"
        ? [
            "最終提出前：まず StudyDone で AI らしさとリスクの高い段落を確認します。",
            "草稿段階：機械的すぎる章や段落をすばやく見つけるために使えます。",
            "授業で：すべてを Turnitin に投げるのではなく、学生自身に AI の使い方を意識させるツールとして利用できます。",
          ]
        : [
            "Before official submission: check AI traces and rewrite risky paragraphs.",
            "For drafts: quickly see which sections look over‑optimized or machine‑written.",
            "For teaching: help students understand AI usage boundaries without running every draft through Turnitin.",
          ];

  const positionTitle =
    locale === "zh"
      ? "StudyDone 的定位"
      : locale === "ja"
        ? "StudyDone の位置づけ"
        : "Positioning";

  const positionText =
    locale === "zh"
      ? "学校仍然会依赖 Turnitin 等工具完成最终查重。StudyDone 更像是“提交前的一层 AI 体检”，让你在上传前就知道哪里可能会有问题。"
      : locale === "ja"
        ? "大学は依然として Turnitin などの大規模データベースに依存します。StudyDone はその前に挟む「AI 健康診断」のような位置づけです。"
        : "Institutions still rely on tools like Turnitin for large plagiarism databases. StudyDone is a Turnitin alternative that lets you focus on AI detection and writing style before you ever upload your file.";

  const positionSub =
    locale === "zh"
      ? "你可以把 StudyDone 理解为“前置自查层”，而 Turnitin 等工具仍然是“最终审核层”。"
      : locale === "ja"
        ? "StudyDone は「セルフチェック層」、Turnitin は「最終審査層」として併用するイメージです。"
        : "Think of StudyDone as the self‑check layer, and Turnitin as the final audit layer.";

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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{whenTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {whenItems.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{positionTitle}</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{positionText}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{positionSub}</p>
        </div>
      </section>
    </div>
  );
}

