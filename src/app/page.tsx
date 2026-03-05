"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            {t("home.heroTitleMain")}
            <span className="block text-primary-600">{t("home.heroTitleSub")}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
            {t("home.heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-primary-500/30 transition hover:bg-primary-700 hover:shadow-xl"
            >
              {t("home.heroPrimaryCta")}
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 transition hover:border-primary-500 hover:bg-primary-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:bg-slate-700"
            >
              {t("home.heroSecondaryCta")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          {t("home.featuresTitle")}
        </h2>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("home.featureMultiTitle")}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t("home.featureMultiDesc")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/50">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("home.featureRiskTitle")}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t("home.featureRiskDesc")}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/50">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {t("home.featureQuotaTitle")}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t("home.featureQuotaDesc")}
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("home.academicTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
            {t("home.academicDesc")}
          </p>
          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-primary-600 px-8 py-3 font-semibold text-white hover:bg-primary-700"
          >
            {t("home.academicCta")}
          </Link>
        </div>
      </section>
    </div>
  );
}

