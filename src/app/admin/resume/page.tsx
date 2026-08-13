import { AdminResumeRequests } from "@/components/admin/AdminResumeRequests";
import { ensurePortfolioAdminAccess } from "@/lib/supabase/adminAccess";
import { getUnreadContactMessageCount } from "@/lib/supabase/contactMessages";
import { getAdminProjects } from "@/lib/supabase/projects";
import { getAdminResumeRequests, getResumeFileState } from "@/lib/supabase/resumeRequests";

export default async function AdminResumePage() {
  await ensurePortfolioAdminAccess();
  const [requests, fileState, projects, unreadMessageCount] = await Promise.all([
    getAdminResumeRequests(),
    getResumeFileState(),
    getAdminProjects(),
    getUnreadContactMessageCount()
  ]);

  return (
    <AdminResumeRequests
      initialRequests={requests}
      fileState={fileState}
      projectCount={projects.length}
      unreadMessageCount={unreadMessageCount}
    />
  );
}
