import type { Metadata } from "next";
import { PlagiarismCheckerPageInner } from "./components/PlagiarismCheckerPageInner";

export const metadata: Metadata = {
  title: "AI Plagiarism Checker for Academic Writing | StudyDone",
  description:
    "AI plagiarism checker for academic essays and papers. Detect AI-written and copy‑pasted content before submission to protect academic integrity.",
};

export default function PlagiarismCheckerPage() {
  return <PlagiarismCheckerPageInner />;
}

