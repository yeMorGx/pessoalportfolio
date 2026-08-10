import { AdminProjects } from "@/components/admin/AdminProjects";
import { getAdminProjects } from "@/lib/supabase/projects";

export default async function AdminPage() {
  const projects = await getAdminProjects();

  return <AdminProjects initialProjects={projects} />;
}
