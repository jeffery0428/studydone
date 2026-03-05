"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMessages, type Locale, SUPPORTED_LOCALES } from "./translations";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function translate(messages: unknown, path: string): string {
  if (!messages) return path;
  return path.split(".").reduce<any>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, messages) as string | undefined ?? path;
}

const STORAGE_KEY = "studydone-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored && (SUPPORTED_LOCALES as { code: Locale }[]).some((l) => l.code === stored)) {
        setLocaleState(stored as Locale);
        return;
      }
      // 默认使用英文，不再根据浏览器语言自动切换
    } catch {
      // ignore
    }
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {
        // ignore
      }
    }
  };

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (path: string) => translate(messages, path),
    }),
    [locale, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LanguageProvider");
  }
  return ctx;
}

