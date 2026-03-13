import type { Metadata } from "next";
import { ChatGptDetectionPageInner } from "./components/ChatGptDetectionPageInner";

export const metadata: Metadata = {
  title: "Detect ChatGPT Writing in Papers | StudyDone",
  description:
    "Detect ChatGPT writing in essays and academic papers. Paragraph‑level AI detection helps you see which parts of a paper look AI‑generated.",
};

export default function ChatGptDetectionPage() {
  return <ChatGptDetectionPageInner />;
}

