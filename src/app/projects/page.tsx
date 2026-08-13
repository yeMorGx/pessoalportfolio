import type { Metadata } from "next";
import { ProjectsArchive } from "@/components/projects-archive/ProjectsArchive";
import { localizedAlternates, localizeProjects } from "@/lib/i18n";
import { getPublicProjects } from "@/lib/supabase/projects";

export const metadata: Metadata = {
  title: "Projects | Gabriel Morgado",
  description: "Product, frontend, systems and security projects developed by Gabriel Morgado.",
  alternates: localizedAlternates("en", "/projects", "/pt/projetos")
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = localizeProjects(await getPublicProjects(), "en");

  return <ProjectsArchive locale="en" projects={projects} />;
}
