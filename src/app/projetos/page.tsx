import type { Metadata } from "next";
import { ProjectsArchive } from "@/components/projects-archive/ProjectsArchive";
import { getPublicProjects } from "@/lib/supabase/projects";

export const metadata: Metadata = {
  title: "Projetos | Gabriel Morgado",
  description: "Projetos de produto, frontend, sistemas e segurança desenvolvidos por Gabriel Morgado."
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return <ProjectsArchive projects={projects} />;
}
