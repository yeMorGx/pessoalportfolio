import { DEFAULT_PROFILE_PHOTO, PROFILE_BUCKET } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getProfilePhoto() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { url: DEFAULT_PROFILE_PHOTO, custom: false, available: false };

  const { data, error } = await supabase.from("site_settings").select("about_photo_path").eq("id", true).single();
  if (error) return { url: DEFAULT_PROFILE_PHOTO, custom: false, available: false };

  const path = data?.about_photo_path as string | null;
  return {
    url: path ? supabase.storage.from(PROFILE_BUCKET).getPublicUrl(path).data.publicUrl : DEFAULT_PROFILE_PHOTO,
    custom: Boolean(path),
    available: true
  };
}
