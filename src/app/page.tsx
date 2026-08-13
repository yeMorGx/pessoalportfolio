import type { Metadata } from "next";
import { PortfolioHome } from "@/components/portfolio/PortfolioHome";
import { localizedAlternates, localizeProjects } from "@/lib/i18n";
import { getPublicProjects } from "@/lib/supabase/projects";

export const metadata: Metadata = {
  title: "Gabriel Morgado | Full-stack Developer",
  description: "Digital products across interfaces, systems and security, designed and built by Gabriel Morgado.",
  alternates: localizedAlternates("en", "/", "/pt")
};

export default async function Home() {
  const projects = localizeProjects(await getPublicProjects(), "en");

  return <PortfolioHome locale="en" projects={projects} />;
}
