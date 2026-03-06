"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";
import { getAccessToken } from "@/lib/client-auth";

type User = { id: string; email: string; name: string | null; role: string; checkQuota: number };
type Order = { id: string; plan: string; credits: number; stripeSessionId: string | null; createdAt: string };
type CreditEntry = {
  id: string;
  type: "purchase" | "check";
  amount: number;
  charCount?: number;
  creditsUsed?: number;
  fileName?: string;
  plan?: string;
  createdAt: string;
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }
    Promise.all([
      apiFetch("/api/auth/me").then((r) => (r.ok ? r.json() : { user: null })),
      apiFetch("/api/me/orders").then((r) => (r.ok ? r.json() : { orders: [] })),
      apiFetch("/api/me/credit-history").then((r) => (r.ok ? r.json() : { history: [] })),
    ])
      .then(([auth, ordersData, historyData]) => {
        setUser(auth.user ?? null);
        setOrders(ordersData.orders ?? []);
        setHistory(historyData.history ?? []);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

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
        <p className="text-slate-600 dark:text-slate-400">{t("account.needLogin")}</p>
        <Link href="/login" className="mt-4 inline-block text-primary-600 hover:underline">
          {t("account.goLogin")}
        </Link>
      </div>
    );
  }

  const dateStr = (s: string) =>
    new Date(s).toLocaleString(locale === "ja" ? "ja-JP" : locale === "en" ? "en-US" : "zh-CN");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
        {t("account.title")}
      </h1>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t("account.profile")}
        </h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("account.email")}</dt>
            <dd className="text-slate-900 dark:text-white">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("account.name")}</dt>
            <dd className="text-slate-900 dark:text-white">{user.name || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("account.role")}</dt>
            <dd className="text-slate-900 dark:text-white">{user.role}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 dark:text-slate-400">{t("account.credits")}</dt>
            <dd className="text-primary-600 font-semibold">{user.checkQuota}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t("account.orders")}
        </h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("account.noOrders")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.orderPlan")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.orderCredits")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.orderDate")}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-3 text-slate-900 dark:text-white">{o.plan}</td>
                    <td className="py-3 text-primary-600">+{o.credits}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{dateStr(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {t("account.creditHistory")}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("account.noHistory")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600">
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.historyType")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.historyChars")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.historyCredits")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.historyFileName")}</th>
                  <th className="pb-2 font-medium text-slate-600 dark:text-slate-300">{t("account.historyDate")}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 dark:border-slate-700">
                    <td className="py-3">
                      {e.type === "purchase" ? (
                        <span className="text-green-600 dark:text-green-400">{t("account.historyPurchase")}</span>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">{t("account.historyCheck")}</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300">
                      {e.type === "check" && e.charCount != null ? e.charCount.toLocaleString() : "—"}
                    </td>
                    <td className={`py-3 font-medium ${e.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-white"}`}>
                      {e.amount >= 0 ? `+${e.amount}` : e.amount}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400 max-w-[180px] truncate" title={e.fileName ?? ""}>
                      {e.type === "check" ? (e.fileName ?? "—") : "—"}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-400">{dateStr(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
