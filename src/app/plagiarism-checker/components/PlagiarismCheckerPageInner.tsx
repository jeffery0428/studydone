"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export function PlagiarismCheckerPageInner() {
  const { locale } = useI18n();

  const title =
    locale === "zh"
      ? "学术写作场景下的 AI 查重工具"
      : locale === "ja"
        ? "学術向け AI 盗用チェック"
        : "AI Plagiarism Checker for Academic Writing";

  const intro =
    locale === "zh"
      ? "StudyDone 既关注 AI 论文检测，也关注传统意义上的抄袭风险。先用 StudyDone 自查 AI 痕迹和异常段落，再决定是否提交到 Turnitin 或学校查重系统。"
      : locale === "ja"
        ? "StudyDone は AI らしさと盗用の両方を意識したチェックを提供します。提出前に AI 生成らしさの強い段落を把握し、必要に応じて Turnitin などにかけることができます。"
        : "StudyDone works as an AI plagiarism checker for academic essays. Check both AI‑like writing patterns and potential copied content before submission.";

  const ctaPrimary =
    locale === "zh" ? "立即检测一篇文档" : locale === "ja" ? "文書をチェックする" : "Check a document now";

  const ctaSecondary =
    locale === "zh" ? "查看套餐与价格" : locale === "ja" ? "プランを見る" : "View pricing plans";

  const useCasesTitle =
    locale === "zh"
      ? "适用的学术场景"
      : locale === "ja"
        ? "学術での利用シーン"
        : "AI plagiarism checker academic use cases";

  const useCases =
    locale === "zh"
      ? [
          "在最终 Turnitin 查重前，先筛查 AI 痕迹较重的段落。",
          "帮助学生理解哪些段落“过于像机器写的”，需要重写或补充自己的思考。",
          "老师在批改前快速获取一份 AI / 抄袭风险信号，而不必改变现有评阅系统。",
        ]
      : locale === "ja"
        ? [
            "最終的な Turnitin 等のチェック前に、AI らしさの強い段落を事前に洗い出します。",
            "学生が「機械的すぎる」文章を把握し、自分の言葉に書き換える手助けになります。",
            "教員が既存のワークフローを変えずに、AI / 盗用リスクのシグナルを得られます。",
          ]
        : [
            "Pre‑screen essays and reports for AI‑generated sections before final Turnitin checks.",
            "Help students understand which paragraphs look too machine‑like and need rewriting.",
            "Support supervisors who want a quick AI plagiarism signal without changing their existing tools.",
          ];

  const compareTitle =
    locale === "zh"
      ? "与传统查重工具的区别"
      : locale === "ja"
        ? "従来の盗用チェックとの違い"
        : "How StudyDone compares";

  const compareText =
    locale === "zh"
      ? "传统查重主要关注文字是否被复制，AI 查重工具则更关注写作模式是否高度 AI 化。StudyDone 提供段落级别的 AI 风险提示，帮助你结合两类信息一起判断。"
      : locale === "ja"
        ? "従来の盗用チェックは「どこからコピーされたか」に強みがあります。AI チェックは「どれだけ AI 的か」にフォーカスします。StudyDone は段落ごとの AI リスクを提示し、両方の情報を組み合わせて判断するのに役立ちます。"
        : "Traditional plagiarism checkers focus on copied text. An AI plagiarism checker like StudyDone focuses on AI writing patterns and segments that may have been heavily generated or paraphrased by AI tools.";

  const compareSub =
    locale === "zh"
      ? "可以将 StudyDone 作为 Turnitin 等系统的“前置自检工具”，让学生在正式查重和提交之前，对 AI 率和风险段落有一个清晰预期。"
      : locale === "ja"
        ? "StudyDone は Turnitin などの前に使う「セルフチェックツール」として位置づけられます。学生は提出前に AI リスクを把握し、自分で修正できます。"
        : "You can use StudyDone as a pre‑check layer before Turnitin so students can understand AI risk and fix issues first.";

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
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{useCasesTitle}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
            {useCases.map((item, idx) => (
              <li key={idx}>• {item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{compareTitle}</h2>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{compareText}</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{compareSub}</p>
        </div>
      </section>
    </div>
  );
}

