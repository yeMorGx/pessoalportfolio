import { AdminResumeRequests } from "@/components/admin/AdminResumeRequests";
import { getUnreadContactMessageCount } from "@/lib/supabase/contactMessages";
import { getAdminProjects } from "@/lib/supabase/projects";
import { getAdminResumeRequests, getResumeFileState } from "@/lib/supabase/resumeRequests";

export default async function AdminResumePage() {
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
