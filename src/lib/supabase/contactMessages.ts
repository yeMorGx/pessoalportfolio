import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactMessageStatus = "new" | "read" | "replied" | "archived";
export type ContactNotificationStatus = "not_configured" | "pending" | "sent" | "failed";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: "en" | "pt";
  status: ContactMessageStatus;
  notification_status: ContactNotificationStatus;
  notification_sent_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getAdminContactMessages() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("contact_messages")
    .select("id,name,email,subject,message,locale,status,notification_status,notification_sent_at,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return [];
  }

  return (data ?? []) as ContactMessage[];
}

export async function getUnreadContactMessageCount() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return error ? 0 : count ?? 0;
}
