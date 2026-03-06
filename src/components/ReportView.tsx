"use client";

import { useI18n } from "@/i18n/LanguageProvider";

type Segment = {
  text: string;
  aiProbability: number;
  riskLevel: string;
  explanation: string;
};

type Props = {
  report: {
    id: string;
    fileName: string;
    overallScore: number;
    segments: Segment[];
    bibliographyScan?: Record<string, unknown> | null;
  };
  onBack: () => void;
};

export function ReportView({ report, onBack }: Props) {
  const { t } = useI18n();

  const scoreColor =
    report.overallScore < 40
      ? "text-green-600 dark:text-green-400"
      : report.overallScore < 70
        ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const riskBadge = (level: string) => {
    const styles =
      level === "low"
        ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400"
        : level === "medium"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400"
          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400";
    const labels = {
      low: t("report.riskLow"),
      medium: t("report.riskMedium"),
      high: t("report.riskHigh"),
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
        {labels[level as keyof typeof labels] || level}
      </span>
    );
  };

  const handleDownloadJson = () => {
    const payload = {
      id: report.id,
      fileName: report.fileName,
      overallScore: report.overallScore,
      segments: report.segments,
      bibliographyScan: report.bibliographyScan ?? undefined,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = report.fileName?.replace(/[^\w.\-]+/g, "_") || "report";
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-8 report-print-container">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t("report.back")}
          </button>
          <span className="text-sm text-slate-500">{report.fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {t("report.downloadPdf")}
          </button>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {t("report.downloadJson")}
          </button>
        </div>
      </div>
      <div className="hidden print:block text-sm text-slate-500 print:mb-4">
        {report.fileName}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-800/50">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          {t("report.overallTitle")}
        </h2>
        <div className="flex items-end gap-4">
          <span className={`text-5xl font-bold ${scoreColor}`}>
            {Math.round(report.overallScore * 100)}%
          </span>
          <p className="mb-2 text-slate-600 dark:text-slate-400">
            {report.overallScore < 40
              ? t("report.overallLow")
              : report.overallScore < 70
                ? t("report.overallMedium")
                : t("report.overallHigh")}
          </p>
        </div>
      </div>

      {report.bibliographyScan != null && Object.keys(report.bibliographyScan).length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            {t("report.bibliographyTitle")}
          </h2>
          <pre className="overflow-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
            {JSON.stringify(report.bibliographyScan, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t("report.segmentsTitle")}
        </h2>
        <div className="space-y-6">
          {report.segments.map((seg, i) => (
            <div
              key={i}
              className={`rounded-xl border p-6 ${
                seg.riskLevel === "high"
                  ? "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-900/20"
                  : seg.riskLevel === "medium"
                    ? "border-amber-200 bg-amber-50/30 dark:border-amber-900/50 dark:bg-amber-900/20"
                    : "border-slate-200 bg-slate-50/30 dark:border-slate-700 dark:bg-slate-800/30"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {t("report.paragraphLabel")} {i + 1}
                </span>
                <div className="flex items-center gap-2">
                  {riskBadge(seg.riskLevel)}
                  <span
                    className={`text-sm font-semibold ${
                      seg.aiProbability >= 0.7
                        ? "text-red-600"
                        : seg.aiProbability >= 0.4
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    AI {Math.round(seg.aiProbability * 100)}%
                  </span>
                </div>
              </div>
              <p className="mb-4 text-slate-800 dark:text-slate-200 leading-relaxed">
                {seg.text}
              </p>
              <div className="rounded-lg bg-white/80 p-3 text-sm text-slate-600 dark:bg-slate-900/50 dark:text-slate-400">
                <span className="font-medium">{t("report.explanationLabel")}</span> {seg.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
