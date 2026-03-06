"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileUpload } from "@/components/FileUpload";
import { ReportView } from "@/components/ReportView";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/client-auth";

type User = { id: string; email: string; name: string | null; role: string; checkQuota: number };
type Report = { id: string; fileName: string; fileType: string; overallScore: number; createdAt: string };

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<{
    id: string;
    fileName: string;
    overallScore: number;
    segments: Array<{ text: string; aiProbability: number; riskLevel: string; explanation: string }>;
    bibliographyScan?: Record<string, unknown> | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentSuccessNotice, setPaymentSuccessNotice] = useState(false);
  const { t, locale } = useI18n();

  useEffect(() => {
    const loadData = () => {
      Promise.all([
        apiFetch("/api/auth/me").then((r) => (r.ok ? r.json() : { user: null })),
        apiFetch("/api/reports").then((r) => (r.ok ? r.json() : { reports: [] })),
      ]).then(([auth, reportsData]) => {
        setUser(auth.user);
        setReports(reportsData.reports || []);
        setLoading(false);
      });
    };

    if (!getAccessToken()) {
      setUser(null);
      setReports([]);
      setLoading(false);
      return;
    }
    loadData();

    const success = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("success")
      : null;
    if (success === "1") {
      setPaymentSuccessNotice(true);
      // 支付回跳后给 webhook 一点处理时间，再次刷新额度
      setTimeout(loadData, 2500);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("success");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }
    }
  }, []);

  useEffect(() => {
    if (!paymentSuccessNotice) return;
    const timer = window.setTimeout(() => {
      setPaymentSuccessNotice(false);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [paymentSuccessNotice]);

  const handleCheckSuccess = (data: { report: unknown; remainingQuota: number }) => {
    const r = data.report as {
      overallScore: number;
      segments: unknown[];
      fileName: string;
      bibliographyScan?: Record<string, unknown> | null;
    };
    setCurrentReport({
      id: "new",
      fileName: r.fileName,
      overallScore: r.overallScore,
      segments: r.segments as Array<{ text: string; aiProbability: number; riskLevel: string; explanation: string }>,
      bibliographyScan: r.bibliographyScan ?? null,
    });
    if (user) setUser({ ...user, checkQuota: data.remainingQuota });
    setReports((prev) => [
      { id: "new", fileName: r.fileName, fileType: "", overallScore: r.overallScore, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const handleViewReport = async (id: string) => {
    const res = await apiFetch(`/api/reports/${id}`);
    const data = await res.json();
    if (data.report) {
      const r = data.report as {
        id: string;
        fileName: string;
        overallScore: number;
        segments: Array<{ text: string; aiProbability: number; riskLevel: string; explanation: string }>;
        bibliographyScan?: Record<string, unknown> | null;
      };
      setCurrentReport({
        ...r,
        bibliographyScan: r.bibliographyScan ?? null,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-slate-600 dark:text-slate-400">{t("dashboard.needLogin")}</p>
        <Link href="/login" className="mt-4 inline-block text-primary-600 hover:underline">
          {t("dashboard.goLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 dark:text-slate-400">
            {t("dashboard.remaining")}{" "}
            <strong className="text-primary-600">{user.checkQuota}</strong>
          </span>
          {user.checkQuota < 3 && (
            <Link
              href="/pricing"
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              {t("dashboard.buyMore")}
            </Link>
          )}
        </div>
      </div>

      {paymentSuccessNotice && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span>{t("dashboard.paymentSuccess")}</span>
          <button
            type="button"
            onClick={() => setPaymentSuccessNotice(false)}
            className="ml-4 rounded px-2 py-1 text-green-700/80 hover:bg-green-100 hover:text-green-900 dark:text-green-300 dark:hover:bg-green-900/50"
            aria-label="close success notice"
          >
            ×
          </button>
        </div>
      )}

      {!currentReport ? (
        <>
          <FileUpload onSuccess={handleCheckSuccess} onError={(msg) => alert(msg)} />
          {reports.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                {t("dashboard.historyTitle")}
              </h2>
              <div className="space-y-2">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => r.id !== "new" && handleViewReport(r.id)}
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-left hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{r.fileName}</span>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${
                          r.overallScore < 40
                            ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
                            : r.overallScore < 70
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400"
                        }`}
                      >
                        AI {Math.round(r.overallScore * 100)}%
                      </span>
                      <span className="text-sm text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString(
                          locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "zh-CN",
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <ReportView
          report={currentReport}
          onBack={() => setCurrentReport(null)}
        />
      )}
    </div>
  );
}
