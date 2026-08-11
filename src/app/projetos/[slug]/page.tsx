import { notFound } from "next/navigation";
import { ProjectShowcase } from "@/components/project-showcase/ProjectShowcase";
import { getProjectBySlug } from "@/lib/supabase/projects";

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <ProjectShowcase project={project} />;
}
