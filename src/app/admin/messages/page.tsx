import { AdminMessages } from "@/components/admin/AdminMessages";
import { getAdminProjects } from "@/lib/supabase/projects";
import { getAdminContactMessages } from "@/lib/supabase/contactMessages";
import { getPendingResumeRequestCount } from "@/lib/supabase/resumeRequests";

export default async function AdminMessagesPage({
  searchParams
}: {
  searchParams?: Promise<{ updated?: string; deleted?: string; error?: string }>;
}) {
  const [params, messages, projects, pendingResumeCount] = await Promise.all([
    searchParams,
    getAdminContactMessages(),
    getAdminProjects(),
    getPendingResumeRequestCount()
  ]);
  const status = params?.error ? "error" : params?.deleted ? "deleted" : params?.updated ? "updated" : undefined;

  return <AdminMessages initialMessages={messages} projectCount={projects.length} pendingResumeCount={pendingResumeCount} status={status} />;
}
