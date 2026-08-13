import type { Metadata } from "next";
import { ProjectsArchive } from "@/components/projects-archive/ProjectsArchive";
import { localizedAlternates, localizeProjects } from "@/lib/i18n";
import { getPublicProjects } from "@/lib/supabase/projects";

export const metadata: Metadata = {
  title: "Projetos | Gabriel Morgado",
  description: "Projetos de produto, frontend, sistemas e segurança desenvolvidos por Gabriel Morgado.",
  alternates: localizedAlternates("pt", "/projects", "/pt/projetos")
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = localizeProjects(await getPublicProjects(), "pt");

  return <ProjectsArchive locale="pt" projects={projects} />;
}
