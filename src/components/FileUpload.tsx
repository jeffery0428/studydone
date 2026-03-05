"use client";

import { useState, useRef } from "react";
import { useI18n } from "@/i18n/LanguageProvider";
import { apiFetch } from "@/lib/api";

type Props = {
  onSuccess: (data: { report: unknown; remainingQuota: number }) => void;
  onError: (msg: string) => void;
};

export function FileUpload({ onSuccess, onError }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const handleFile = async (file: File) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      onError(t("upload.invalidType"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError(t("upload.tooLarge"));
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiFetch("/api/check", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg: string = data?.error || "";
        if (msg.includes("already queued") || msg.includes("similar document check")) {
          onError(t("upload.duplicateTask"));
        } else {
          onError(msg || t("upload.checkFailed"));
        }
        return;
      }
      onSuccess(data);
    } catch {
      onError(t("upload.uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition ${
        dragging
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:border-slate-500"
      } ${uploading ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.pdf,.txt,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,text/plain"
        onChange={onInputChange}
        className="hidden"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-slate-600 dark:text-slate-400">{t("upload.analyzing")}</p>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/50">
            <svg className="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-900 dark:text-white">
            {t("upload.headline")}
          </p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("upload.subline")}
          </p>
        </>
      )}
    </div>
  );
}
