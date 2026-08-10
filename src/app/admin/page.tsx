import { AdminProjects } from "@/components/admin/AdminProjects";
import { getAdminProjects } from "@/lib/supabase/projects";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{
    deleted?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const projects = await getAdminProjects();
  const status = params?.error ? "error" : params?.deleted ? "deleted" : params?.updated ? "updated" : undefined;

  return <AdminProjects initialProjects={projects} status={status} />;
}
