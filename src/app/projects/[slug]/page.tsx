import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectShowcase } from "@/components/project-showcase/ProjectShowcase";
import { localizedAlternates, localizeProject, projectPath } from "@/lib/i18n";
import { getProjectBySlug } from "@/lib/supabase/projects";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const sourceProject = await getProjectBySlug(slug);

  if (!sourceProject) {
    return {};
  }

  const project = localizeProject(sourceProject, "en");
  return {
    title: `${project.title} | Gabriel Morgado`,
    description: project.description,
    alternates: localizedAlternates("en", projectPath("en", slug), projectPath("pt", slug))
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const sourceProject = await getProjectBySlug(slug);

  if (!sourceProject) {
    notFound();
  }

  return <ProjectShowcase locale="en" project={localizeProject(sourceProject, "en")} />;
}
