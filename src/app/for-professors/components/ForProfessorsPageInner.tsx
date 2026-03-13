"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export function ForProfessorsPageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "面向教师的 AI 检测工作流"
      : locale === "ja"
        ? "教員向け AI 検出ワークフロー"
        : "AI Detection Workflow for Professors";

  const intro =
    locale === "zh"
      ? "StudyDone 为教师和导师提供一套轻量的 AI 检测 + AI 查重 流程，用来预筛学生作业和论文，而不是强行改变你现在的教学系统。"
      : locale === "ja"
        ? "StudyDone は教員向けに、既存の採点フローを変えずに学生レポートの AI 依存度を確認できるツールです。"
        : "StudyDone provides an AI detection checker and AI plagiarism checker tailored for academic use. It helps professors spot AI‑heavy sections without replacing existing grading workflows.";

  const ctaPrimary =
    locale === "zh"
      ? "用样例论文试用 StudyDone"
      : locale === "ja"
        ? "サンプルレポートで試す"
        : "Try StudyDone with sample papers";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const designedTitle =
    locale === "zh"
      ? "为教师而设计"
      : locale === "ja"
        ? "教員のために設計"
        : "Designed for professors";

  const designedItems =
    locale === "zh"
      ? [
          "快速标记可能过度依赖 AI 工具完成的作业。",
          "关注段落级别的 AI 风险，而不是一个难以解释的总分。",
          "可以与 Turnitin 或校内系统一起使用，作为额外的 AI 信号来源。",
        ]
      : locale === "ja"
        ? [
            "AI ツールに大きく依存している可能性のあるレポートを素早く見分けます。",
            "1 つのスコアではなく、段落ごとの AI リスクに注目できます。",
            "Turnitin や学内システムと併用し、追加の AI シグナルとして利用できます。",
          ]
        : [
            "Quickly flag essays that are likely over‑reliant on AI tools.",
            "Focus on paragraph‑level AI scores instead of one hard‑to‑interpret percentage.",
            "Use alongside Turnitin or institutional systems as an extra AI signal.",
          ];

  const workflowTitle =
    locale === "zh"
      ? "推荐使用流程"
      : locale === "ja"
        ? "おすすめの使い方"
        : "Suggested workflow";

  const workflowSteps =
    locale === "zh"
      ? [
          "鼓励学生在最终提交前，先用 StudyDone 自查 AI 率和高风险段落。",
          "对可疑作业，可使用教师账号在 StudyDone 中重新检测一次。",
          "将 AI 检测结果作为对话起点，而不是自动处罚依据。",
        ]
      : locale === "ja"
        ? [
            "学生に対し、最終提出前に StudyDone で AI リスクをセルフチェックするよう案内します。",
            "必要に応じて、教員用アカウントで同じ文書を再チェックします。",
            "AI 検出結果は罰ではなく、学生との対話のきっかけとして使います。",
          ]
        : [
            "Ask students to self‑check with StudyDone before final submission.",
            "Optionally re‑check suspicious work with your own StudyDone account.",
            "Use AI detection results as a conversation starter, not an automatic penalty.",
          ];

  const workflowNote =
    locale === "zh"
      ? "StudyDone 更适合作为“辅助手段”和“对话起点”，帮助教师判断哪些作业需要进一步人工核查。"
      : locale === "ja"
        ? "StudyDone は「補助ツール」「対話のきっかけ」として使うのに適しており、どのレポートを重点的に読むべきか判断する助けになります。"
        : "StudyDone is best used as a supportive signal and starting point for conversation, helping you decide which papers need deeper manual review.";

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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{designedTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {designedItems.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{workflowTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {workflowSteps.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{workflowNote}</p>
        </div>
      </section>
    </div>
  );
}

