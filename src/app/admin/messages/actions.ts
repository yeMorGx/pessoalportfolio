"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactMessageStatus } from "@/lib/supabase/contactMessages";

const allowedStatuses = new Set<ContactMessageStatus>(["new", "read", "replied", "archived"]);

async function requireAdminSession() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAllowedAdminEmail(user.email)) {
    redirect("/admin/login");
  }

  return supabase;
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateContactMessageStatusAction(formData: FormData) {
  const id = getFormText(formData, "id");
  const status = getFormText(formData, "status") as ContactMessageStatus;

  if (!id || !allowedStatuses.has(status)) {
    redirect("/admin/messages?error=invalid");
  }

  const supabase = await requireAdminSession();
  const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  redirect(error ? "/admin/messages?error=update" : "/admin/messages?updated=1");
}

export async function deleteContactMessageAction(formData: FormData) {
  const id = getFormText(formData, "id");

  if (!id) {
    redirect("/admin/messages?error=invalid");
  }

  const supabase = await requireAdminSession();
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/admin/messages");
  redirect(error ? "/admin/messages?error=delete" : "/admin/messages?deleted=1");
}
