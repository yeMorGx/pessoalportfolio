import type { Metadata } from "next";
import { ResumeStatusPage } from "@/components/resume/ResumeStatusPage";

export const metadata: Metadata = { title: "Resume request status | Gabriel Morgado", robots: { index: false, follow: false } };

export default async function ResumeStatusRoute({ searchParams }: { searchParams?: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return <ResumeStatusPage locale="en" token={params?.token ?? ""} />;
}
