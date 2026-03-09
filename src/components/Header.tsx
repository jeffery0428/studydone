"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";
import { clearAccessToken, getAccessToken } from "@/lib/client-auth";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  checkQuota: number;
};

export function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const { t, locale, setLocale } = useI18n();

  useEffect(() => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    apiFetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    clearAccessToken();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 print:hidden">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary-600">
          <span className="text-xl">StudyDone</span>
          <span className="rounded bg-primary-100 px-2 py-0.5 text-xs text-primary-700 dark:bg-primary-900/50">
            {t("nav.aiTag")}
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium ${pathname === "/" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/dashboard"
            className={`text-sm font-medium ${pathname === "/dashboard" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
          >
            {t("nav.dashboard")}
          </Link>
          <Link
            href="/pricing"
            className={`text-sm font-medium ${pathname === "/pricing" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
          >
            {t("nav.pricing")}
          </Link>
          <Link
            href="/human-review"
            className={`text-sm font-medium ${pathname === "/human-review" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
          >
            {t("nav.humanReview")}
          </Link>
          <Link
            href="/ai-clean"
            className={`text-sm font-medium ${pathname === "/ai-clean" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
          >
            {t("nav.aiClean")}
          </Link>
          <a
            href="https://t.me/+nLcrms3lOhg1MWM1"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {t("nav.support")}
          </a>
          {user && (
            <Link
              href="/account"
              className={`text-sm font-medium ${pathname === "/account" ? "text-primary-600" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"}`}
            >
              {t("nav.account")}
            </Link>
          )}

          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Language</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as any)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </label>

          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {t("nav.quota")}{" "}
                <strong className="text-primary-600">{user.checkQuota}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
              >
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
