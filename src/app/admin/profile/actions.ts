"use server";

import { revalidatePath } from "next/cache";
import { isAllowedAdminEmail } from "@/lib/auth/admin";
import { MAX_PROFILE_BYTES, PROFILE_BUCKET, PROFILE_TYPES } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) throw new Error("Supabase não está configurado neste ambiente.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAllowedAdminEmail(user.email)) throw new Error("Sua sessão expirou. Entre novamente no painel.");
  // The database and Storage policies enforce the registered admin role as well.
  return supabase;
}

export async function createProfileUpload(input: { type: string; size: number }) {
  try {
    const supabase = await requireAdmin();
    const extension = PROFILE_TYPES[input.type];
    if (!extension || !Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_PROFILE_BYTES) {
      return { ok: false as const, message: "Escolha uma foto JPG, PNG ou WebP de até 5 MB." };
    }
    const path = `portraits/${crypto.randomUUID()}.${extension}`;
    const { data, error } = await supabase.storage.from(PROFILE_BUCKET).createSignedUploadUrl(path);
    if (error) return { ok: false as const, message: "Não foi possível preparar o envio. Confira seu acesso de administrador e tente novamente." };
    return { ok: true as const, path: data.path, token: data.token };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Não foi possível preparar o envio." };
  }
}

export async function saveProfilePhoto(path: string | null) {
  try {
    const supabase = await requireAdmin();
    if (path !== null) {
      if (!/^portraits\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(path)) throw new Error("A foto enviada é inválida. Selecione o arquivo novamente.");
      const name = path.split("/")[1];
      const { data, error } = await supabase.storage.from(PROFILE_BUCKET).list("portraits", { search: name, limit: 10 });
      const file = data?.find((item) => item.name === name);
      const mime = file?.metadata?.mimetype ?? "";
      const size = file?.metadata?.size ?? 0;
      if (error || !file || !PROFILE_TYPES[mime] || size <= 0 || size > MAX_PROFILE_BYTES) {
        throw new Error("O envio da foto não foi concluído. Selecione o arquivo e tente novamente.");
      }
    }
    const { data, error } = await supabase.from("site_settings").update({ about_photo_path: path }).eq("id", true).select("id").single();
    if (error || !data) throw new Error("Não foi possível salvar a foto. Confira seu acesso de administrador e tente novamente.");
    revalidatePath("/");
    revalidatePath("/pt");
    revalidatePath("/admin/profile");
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "Não foi possível salvar a foto." };
  }
}
