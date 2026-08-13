import type { Metadata } from "next";
import { ResumeRequestPage } from "@/components/resume/ResumeRequestPage";
import { localizedAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Solicitar currículo | Gabriel Morgado",
  description: "Solicite acesso temporário e protegido ao currículo profissional de Gabriel Morgado.",
  alternates: localizedAlternates("pt", "/resume", "/pt/curriculo")
};

export default function ResumePage() {
  return <ResumeRequestPage locale="pt" />;
}
