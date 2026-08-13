import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function ensurePortfolioAdminAccess() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const { error } = await supabase.functions.invoke("resume-file-admin", {
    body: { action: "status" }
  });

  return !error;
}
