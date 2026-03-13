import type { Metadata } from "next";
import { ForProfessorsPageInner } from "./components/ForProfessorsPageInner";

export const metadata: Metadata = {
  title: "AI Detection Tool for Professors | StudyDone",
  description:
    "AI detection and plagiarism‑aware workflow for professors. Quickly screen student work for AI writing and risky paragraphs before grading.",
};

export default function ForProfessorsPage() {
  return <ForProfessorsPageInner />;
}

