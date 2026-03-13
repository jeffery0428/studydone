import type { Metadata } from "next";
import { AiDetectorPageInner } from "./components/AiDetectorPageInner";

export const metadata: Metadata = {
  title: "AI Detection Checker for Essays & Papers | StudyDone",
  description:
    "Use StudyDone as an AI detection checker before submission. Detect AI traces in essays and academic papers with paragraph-level analysis.",
};

export default function AiDetectorPage() {
  return <AiDetectorPageInner />;
}

