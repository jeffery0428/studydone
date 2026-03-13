"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

const tgSupportUrl = "https://t.me/+nLcrms3lOhg1MWM1";

export function AiDetectorPageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "AI 论文检测与论文 AI 率检测"
      : locale === "ja"
        ? "論文向け AI 検出チェッカー"
        : "AI Detection Checker for Essays & Papers";

  const intro =
    locale === "zh"
      ? "StudyDone 是一款专为学术场景打造的 AI 论文检测 / 论文 AI 率检测 工具，提交前先自查 AI 痕迹，降低被系统判定为 AI 生成的风险。"
      : locale === "ja"
        ? "StudyDone は学生と教員向けの AI 文章検出ツールです。レポートや論文を提出する前に AI らしさをチェックできます。"
        : "Use StudyDone as your AI detection checker before submission. Our AI writing detector is designed for students and teachers to catch AI-generated content in essays, reports and academic papers.";

  const introSub =
    locale === "zh"
      ? "适用于课程论文、毕业论文、申请文书等，在上传到学校系统或 Turnitin 之前，先进行一次 AI 痕迹自检。"
      : locale === "ja"
        ? "提出前に一度チェックすることで、AI 依存度の高い段落を見つけ、提出前に書き換えることができます。"
        : "Run a check before you upload your file to Turnitin or your LMS so you can rewrite risky paragraphs first.";

  const ctaPrimary =
    locale === "zh" ? "立即开始 AI 检测" : locale === "ja" ? "AI 検出を試す" : "Start AI detection now";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const whyTitle =
    locale === "zh"
      ? "为什么要在提交前先做 AI 检测？"
      : locale === "ja"
        ? "提出前に AI 検出を行う理由"
        : "Why check AI content before submission?";

  const whyItems =
    locale === "zh"
      ? [
          "在提交到 Turnitin 或学校系统前，先检查论文中 AI 痕迹最重的段落。",
          "按段落给出 AI 风险评分，而不是只有一个难以解释的总分。",
          "支持 docx / pdf / txt，直接使用你准备提交的文件。",
        ]
      : locale === "ja"
        ? [
            "レポートや論文を LMS や Turnitin に提出する前に、AI らしさの強い段落を特定します。",
            "1つのスコアではなく、段落ごとの AI リスクを表示します。",
            "docx / pdf / txt に対応し、そのまま提出予定のファイルをチェックできます。",
          ]
        : [
            "Detect AI-generated writing in essays, reports and term papers before you upload to Turnitin or your LMS.",
            "Paragraph-level scores help you see where AI traces are strongest instead of a single opaque number.",
            "Supports docx / pdf / txt so you can reuse the same file you plan to submit.",
          ];

  const integrityTitle =
    locale === "zh"
      ? "服务于学术诚信"
      : locale === "ja"
        ? "学術的な誠実さを守るために"
        : "For academic integrity";

  const integrityText =
    locale === "zh"
      ? "越来越多的学校在查重工具之外增加 AI 检测。通过 StudyDone 先做 AI 检测，你可以在提交前主动调整高风险段落，让文本更贴近自己的真实写作风格。"
      : locale === "ja"
        ? "多くの大学が盗用チェックだけでなく AI 検出も導入し始めています。StudyDone で事前チェックを行うことで、AI 依存度の高い段落を提出前に書き換えることができます。"
        : "Many universities now use AI detectors alongside plagiarism tools. By running your work through an AI detection checker first, you can rewrite risky paragraphs and keep your submission closer to your own voice.";

  const supportTitle =
    locale === "zh"
      ? "支持与答疑"
      : locale === "ja"
        ? "サポート"
        : "Support";

  const supportText =
    locale === "zh"
      ? "对 AI 检测结果有疑问？可以加入 Telegram 群（请先去除个人隐私信息再发送样例）："
      : locale === "ja"
        ? "AI 検出結果について質問がありますか？個人情報を削除したサンプルを共有するために、Telegram グループに参加できます。"
        : "Questions about AI detection results? Join our Telegram support group and share a sample (with personal data removed):";

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{intro}</p>
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{introSub}</p>
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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{integrityTitle}</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{integrityText}</p>
        </div>
      </section>

      <section className="mt-12 border-t border-slate-200 pt-8 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{supportTitle}</h2>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          {supportText}{" "}
          <a
            href={tgSupportUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-primary-600 hover:underline"
          >
            Studydone-support on Telegram
          </a>
          .
        </p>
      </section>
    </div>
  );
}

