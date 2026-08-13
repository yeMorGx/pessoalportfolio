import type { Metadata } from "next";
import { ResumeRequestPage } from "@/components/resume/ResumeRequestPage";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Request resume | Gabriel Morgado",
  description: "Request temporary, protected access to Gabriel Morgado's professional resume.",
  alternates: localizedAlternates("en", "/resume", "/pt/curriculo")
};

export default function ResumePage() {
  return <ResumeRequestPage locale="en" />;
}
