import { AdminProjects } from "@/components/admin/AdminProjects";
import { getUnreadContactMessageCount } from "@/lib/supabase/contactMessages";
import { getAdminProjects } from "@/lib/supabase/projects";
import { getPendingResumeRequestCount } from "@/lib/supabase/resumeRequests";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{
    deleted?: string;
    created?: string;
    updated?: string;
    error?: string;
  }>;
}) {
  const [params, projects, unreadMessageCount, pendingResumeCount] = await Promise.all([
    searchParams,
    getAdminProjects(),
    getUnreadContactMessageCount(),
    getPendingResumeRequestCount()
  ]);
  const status = params?.error ? "error" : params?.created ? "created" : params?.deleted ? "deleted" : params?.updated ? "updated" : undefined;

  return <AdminProjects initialProjects={projects} unreadMessageCount={unreadMessageCount} pendingResumeCount={pendingResumeCount} status={status} />;
}
