"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export function ForStudentsPageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "面向学生的 AI 检测与查重工具"
      : locale === "ja"
        ? "学生向け AI 検出 & チェッカー"
        : "AI Detection & Plagiarism Checker for Students";

  const intro =
    locale === "zh"
      ? "在提交前，用 StudyDone 做一次 论文 AI 率检测 + AI 查重 自查，先找到高风险段落，再有针对性地改写。"
      : locale === "ja"
        ? "提出前に StudyDone で AI 率とリスクの高い段落を確認し、自分の言葉に書き換えるためのツールです。"
        : "StudyDone gives students an AI detection checker and AI plagiarism checker in one place, so you can fix issues before your teacher or Turnitin ever see your work.";

  const ctaPrimary =
    locale === "zh"
      ? "注册并领取免费积分"
      : locale === "ja"
        ? "無料クレジットで始める"
        : "Sign up and get free credits";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const howTitle =
    locale === "zh"
      ? "学生如何使用 StudyDone？"
      : locale === "ja"
        ? "学生による StudyDone の使い方"
        : "How students use StudyDone";

  const howSteps =
    locale === "zh"
      ? [
          "先按自己的理解完成初稿（可以适度使用 AI 辅助，但不要整篇生成）。",
          "上传准备提交的同一份文件，运行一次 AI 检测。",
          "对高风险段落逐段重写，直到风格更接近你的真实表达。",
        ]
      : locale === "ja"
        ? [
            "まずは自分の言葉で下書きを書きます（必要に応じて軽い AI 補助を使っても構いません）。",
            "最終提出と同じファイルをアップロードし、AI 検出を実行します。",
            "AI リスクの高い段落を中心に、自分らしい文章に書き換えます。",
          ]
        : [
            "Write your draft in your own words (with or without AI assistance).",
            "Upload the same file you plan to submit and run an AI detection check.",
            "Rewrite high‑risk paragraphs until the style matches your natural voice.",
          ];

  const integrityTitle =
    locale === "zh"
      ? "帮助你守住学术红线"
      : locale === "ja"
        ? "学術的不正を避けるために"
        : "Good for academic integrity";

  const integrityText =
    locale === "zh"
      ? "StudyDone 不是用来“抓你”的，而是帮你自己先抓出高风险 AI 使用，让最终提交更符合学校的政策要求。"
      : locale === "ja"
        ? "StudyDone はあなたを罰するためのツールではなく、自分でリスクの高い AI 利用を見つけるためのツールです。"
        : "StudyDone is not here to “catch” you. It is here to help you catch risky AI usage yourself and keep your final submission within your school’s policy.";

  const integritySub =
    locale === "zh"
      ? "可以把 StudyDone 当成“提交前的体检工具”，而不是惩罚工具——目的是帮你在可控范围内使用 AI，同时避免学术不端。"
      : locale === "ja"
        ? "提出前の「健康診断」のような位置づけで使ってください。AI をうまく活用しつつ、学術的不正を避けることが目的です。"
        : "Think of StudyDone as a pre‑submission health check, not a punishment tool: the goal is to help you use AI responsibly while avoiding academic misconduct.";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{intro}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/register"
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{howTitle}</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
            {howSteps.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{integrityTitle}</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{integrityText}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{integritySub}</p>
        </div>
      </section>
    </div>
  );
}

