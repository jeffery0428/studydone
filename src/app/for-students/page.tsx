import type { Metadata } from "next";
import { ForStudentsPageInner } from "./components/ForStudentsPageInner";

export const metadata: Metadata = {
  title: "AI Detection & Plagiarism Checker for Students | StudyDone",
  description:
    "AI detection checker and plagiarism‑aware workflow for students. Check AI rate and risky paragraphs in your essay before submission.",
};

export default function ForStudentsPage() {
  return <ForStudentsPageInner />;
}

