import { fallbackProjects, type Project, type ProjectGalleryImageSize } from "@/lib/projects";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

type RawProject = Partial<Project> & {
  id: string;
  title: string;
  slug: string;
  description: string;
};

function normalizeProject(project: RawProject): Project {
  const coverDisplay = project.cover_display === "fullscreen" ? "fullscreen" : "thumbnail";
  const galleryImageSizes = Array.isArray(project.gallery_image_sizes)
    ? project.gallery_image_sizes.map((size) => normalizeGallerySize(String(size)))
    : [];

  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    description: project.description,
    cover_image_url: project.cover_image_url || "/project-forge.svg",
    cover_display: coverDisplay,
    product_overview: project.product_overview || null,
    gallery_image_urls: Array.isArray(project.gallery_image_urls) ? project.gallery_image_urls : [],
    gallery_image_sizes: galleryImageSizes,
    video_url: project.video_url || null,
    product_role: project.product_role || null,
    product_features: Array.isArray(project.product_features) ? project.product_features : [],
    product_results: Array.isArray(project.product_results) ? project.product_results : [],
    tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
    project_url: project.project_url || null,
    repo_url: project.repo_url || null,
    featured: Boolean(project.featured),
    order: typeof project.order === "number" ? project.order : 0
  };
}

function normalizeGallerySize(size: string): ProjectGalleryImageSize {
  if (size === "small" || size === "medium" || size === "large" || size === "full") {
    return size;
  }

  return "medium";
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

export async function getProjectBySlug(slug: string) {
  const fallbackProject = fallbackProjects.find((project) => project.slug === slug) ?? null;

  if (!hasSupabaseConfig()) {
    return fallbackProject;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fallbackProject;
  }

  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();

  if (error || !data) {
    return fallbackProject;
  }

  return normalizeProject(data as RawProject);
}
