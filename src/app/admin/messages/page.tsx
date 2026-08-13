import { AdminMessages } from "@/components/admin/AdminMessages";
import { getAdminProjects } from "@/lib/supabase/projects";
import { getAdminContactMessages } from "@/lib/supabase/contactMessages";

export default async function AdminMessagesPage({
  searchParams
}: {
  searchParams?: Promise<{ updated?: string; deleted?: string; error?: string }>;
}) {
  const [params, messages, projects] = await Promise.all([
    searchParams,
    getAdminContactMessages(),
    getAdminProjects()
  ]);
  const status = params?.error ? "error" : params?.deleted ? "deleted" : params?.updated ? "updated" : undefined;

  return <AdminMessages initialMessages={messages} projectCount={projects.length} status={status} />;
}
