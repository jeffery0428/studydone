import type { Metadata } from "next";
import { TurnitinAlternativePageInner } from "./components/TurnitinAlternativePageInner";

export const metadata: Metadata = {
  title: "Turnitin Alternative with AI Detection | StudyDone",
  description:
    "Lightweight Turnitin alternative focused on AI detection. Help students and teachers pre‑check AI content and risk paragraphs before official submission.",
};

export default function TurnitinAlternativePage() {
  return <TurnitinAlternativePageInner />;
}

