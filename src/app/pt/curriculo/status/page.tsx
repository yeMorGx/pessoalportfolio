import type { Metadata } from "next";
import { ResumeStatusPage } from "@/components/resume/ResumeStatusPage";

export const metadata: Metadata = { title: "Estado da solicitação | Gabriel Morgado", robots: { index: false, follow: false } };

export default async function ResumeStatusRoute({ searchParams }: { searchParams?: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return <ResumeStatusPage locale="pt" token={params?.token ?? ""} />;
}
