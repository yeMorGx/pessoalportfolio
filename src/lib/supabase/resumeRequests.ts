import { createSupabaseServerClient } from "@/lib/supabase/server";
import { RESUME_BUCKET, type ResumeFileState, type ResumeRequest } from "@/lib/resume";

export async function getAdminResumeRequests() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("resume_requests")
    .select("id,name,email,company,job_title,linkedin_url,purpose,locale,status,access_expires_at,admin_note,request_notification_status,decision_notification_status,approved_at,rejected_at,revoked_at,last_download_at,download_count,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return error ? [] : (data ?? []) as ResumeRequest[];
}

export async function getPendingResumeRequestCount() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("resume_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  return error ? 0 : count ?? 0;
}

export async function getResumeFileState(): Promise<ResumeFileState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { available: false, size: null, updatedAt: null };
  }

  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .list("current", { search: "gabriel-morgado-resume.pdf", limit: 10 });
  const file = data?.find((item) => item.name === "gabriel-morgado-resume.pdf");

  if (error || !file) {
    return { available: false, size: null, updatedAt: null };
  }

  return {
    available: true,
    size: typeof file.metadata?.size === "number" ? file.metadata.size : null,
    updatedAt: file.updated_at ?? file.created_at ?? null
  };
}
