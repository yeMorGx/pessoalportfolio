import { fallbackProjects, type Project } from "@/lib/projects";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

type RawProject = Partial<Project> & {
  id: string;
  title: string;
  slug: string;
  description: string;
};

function normalizeProject(project: RawProject): Project {
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    cover_image_url: project.cover_image_url || "/project-forge.svg",
    tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
    project_url: project.project_url || null,
    repo_url: project.repo_url || null,
    featured: Boolean(project.featured),
    order: typeof project.order === "number" ? project.order : 0
  };
}

export async function getPublicProjects() {
  if (!hasSupabaseConfig()) {
    return fallbackProjects;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackProjects;
  }

  const { data, error } = await supabase.from("projects").select("*").order("order", { ascending: true });

  if (error || !data?.length) {
    return fallbackProjects;
  }

  return (data as RawProject[]).map(normalizeProject);
}

export async function getAdminProjects() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackProjects;
  }

  const { data, error } = await supabase.from("projects").select("*").order("order", { ascending: true });

  if (error) {
    return fallbackProjects;
  }

  return ((data ?? []) as RawProject[]).map(normalizeProject);
}
