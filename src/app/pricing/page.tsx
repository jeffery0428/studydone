"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";

const PLANS = [
  {
    id: "5",
    quota: 250,
    price: 5,
    popular: true,
    enabled: true,
    nameKey: "pricing.planBasicName",
    descKey: "pricing.planBasicDesc",
  },
  {
    id: "50",
    quota: 2500,
    price: 48,
    popular: false,
    enabled: true,
    nameKey: "pricing.planProName",
    descKey: "pricing.planProDesc",
  },
  {
    id: "200",
    quota: 10000,
    price: 195,
    popular: false,
    enabled: true,
    nameKey: "pricing.planTeacherName",
    descKey: "pricing.planTeacherDesc",
  },
];

export default function PricingPage() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentCanceled, setPaymentCanceled] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    apiFetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user));
    if (typeof window !== "undefined") {
      const canceled = new URLSearchParams(window.location.search).get("canceled");
      setPaymentCanceled(canceled === "1");
      if (canceled === "1") {
        const url = new URL(window.location.href);
        url.searchParams.delete("canceled");
        window.history.replaceState({}, "", `${url.pathname}${url.search}`);
      }
    }
  }, []);

  const handleCheckout = async (planId: string) => {
    if (!user) {
      window.location.href = "/login?redirect=/pricing";
      return;
    }
    setLoading(planId);
    try {
      const res = await apiFetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || t("pricing.errorCreate"));
      }
    } catch {
      alert(t("pricing.errorNetwork"));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          {t("pricing.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-600 dark:text-slate-400">
          {t("pricing.subtitle")}
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-3xl space-y-3">
        {paymentCanceled && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {t("pricing.paymentCanceled")}
          </div>
        )}
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-8 ${
              plan.popular
                ? "border-primary-500 bg-primary-50/50 shadow-lg dark:border-primary-600 dark:bg-primary-900/20"
                : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-4 py-1 text-xs font-medium text-white">
                ★
              </span>
            )}
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {t(plan.nameKey)}
            </h3>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {t(plan.descKey)}
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">
                USD {plan.price}
              </span>
              <span className="text-slate-500">/ {plan.quota}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {t("pricing.perUsagePrefix")} USD 
              {(plan.price / plan.quota).toFixed(2)}
            </p>
            <button
              onClick={() => plan.enabled && handleCheckout(plan.id)}
              disabled={!!loading || !plan.enabled}
              className={`mt-8 w-full rounded-xl py-3 font-semibold transition ${
                plan.popular
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "border-2 border-slate-300 text-slate-700 hover:border-primary-500 hover:bg-primary-50 dark:border-slate-600 dark:text-slate-200 dark:hover:border-primary-500 dark:hover:bg-primary-900/30"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {!plan.enabled
                ? t("pricing.notAvailableForTest")
                : loading === plan.id
                  ? t("pricing.redirecting")
                  : t("pricing.buyNow")}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {t("pricing.paymentTitle")}
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• {t("pricing.paymentLine1")}</li>
          <li>• {t("pricing.paymentLine2")}</li>
          <li>• {t("pricing.paymentLine3")}</li>
        </ul>
      </div>
    </div>
  );
}
