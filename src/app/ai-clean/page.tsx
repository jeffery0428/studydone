"use client";

import { useI18n } from "@/i18n/LanguageProvider";

export default function AiCleanPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
        {t("future.aiCleanTitle")}
      </h1>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        {t("future.aiCleanDesc")}
      </p>
      <span className="inline-block rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-200">
        {t("future.comingSoon")}
      </span>
    </div>
  );
}
