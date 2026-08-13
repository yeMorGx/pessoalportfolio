import type { Metadata } from "next";
import { ResumeAccessPage } from "@/components/resume/ResumeAccessPage";

export const metadata: Metadata = {
  title: "Private resume access | Gabriel Morgado",
  robots: { index: false, follow: false },
  referrer: "no-referrer"
};

export default function ResumeAccessRoute() {
  return <ResumeAccessPage />;
}
