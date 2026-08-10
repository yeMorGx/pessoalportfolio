"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

function getOptionalString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function getRequiredString(formData: FormData, key: string) {
  const value = getOptionalString(formData, key);

  if (!value) {
    throw new Error(`Campo obrigatório: ${key}`);
  }

  return value;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseStack(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toInteger(value: string | null) {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

async function uploadCover(formData: FormData, fallbackUrl: string | null) {
  const file = formData.get("cover");

  if (!(file instanceof File) || file.size === 0) {
    return fallbackUrl ?? "/project-forge.svg";
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const extension = file.name.split(".").pop() ?? "webp";
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("project-covers").upload(path, file, {
    cacheControl: "31536000",
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from("project-covers").getPublicUrl(path);
  return data.publicUrl;
}

export async function saveProjectAction(formData: FormData) {
  if (!hasSupabaseConfig()) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de salvar.");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const title = getRequiredString(formData, "title");
  const id = getOptionalString(formData, "id");
  const currentCoverUrl = getOptionalString(formData, "current_cover_image_url");
  const coverImageUrl = await uploadCover(formData, currentCoverUrl);

  const payload = {
    title,
    slug: getOptionalString(formData, "slug") ?? slugify(title),
    description: getRequiredString(formData, "description"),
    cover_image_url: coverImageUrl,
    tech_stack: parseStack(getOptionalString(formData, "tech_stack")),
    project_url: getOptionalString(formData, "project_url"),
    repo_url: getOptionalString(formData, "repo_url"),
    featured: formData.get("featured") === "on",
    order: toInteger(getOptionalString(formData, "order"))
  };

  const query = id
    ? supabase.from("projects").update(payload).eq("id", id)
    : supabase.from("projects").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProjectAction(formData: FormData) {
  const id = getRequiredString(formData, "id");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function toggleFeaturedAction(formData: FormData) {
  const id = getRequiredString(formData, "id");
  const featured = formData.get("featured") === "true";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.from("projects").update({ featured: !featured }).eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function signInAction(formData: FormData) {
  const email = getRequiredString(formData, "email");
  const password = getRequiredString(formData, "password");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=1");
  }

  redirect("/admin");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/admin/login");
}
