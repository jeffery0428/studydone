import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { LanguageProvider } from "@/i18n/LanguageProvider";

export const metadata: Metadata = {
  title: "StudyDone - AI Detector for Students & Teachers",
  description:
    "AI writing detector designed for students and educators. Check AI traces in essays and papers with paragraph-level analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased min-h-screen">
        <LanguageProvider>
          <Header />
          <main>{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}

