import { fallbackProjects, type Project } from "@/lib/projects";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

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

  return data as Project[];
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

  return (data ?? []) as Project[];
}
