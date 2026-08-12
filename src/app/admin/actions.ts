"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/auth/admin";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase/server";

const PROJECT_ASSET_BUCKET = "project-covers";
const MAX_PROJECT_IMAGE_BYTES = 20 * 1024 * 1024;

export type ProjectUploadTargetResult =
  | { ok: true; path: string; token: string }
  | { ok: false; message: string };

export type SaveProjectResult =
  | { ok: true }
  | { ok: false; message: string };

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

function parseTextList(value: string | null) {
  return (value ?? "")
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeGallerySize(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();

  if (normalized === "pequeno" || normalized === "small" || normalized === "p") {
    return "small";
  }

  if (normalized === "grande" || normalized === "large" || normalized === "g") {
    return "large";
  }

  if (normalized === "total" || normalized === "full" || normalized === "inteiro") {
    return "full";
  }

  return "medium";
}

function parseGallery(value: string | null) {
  const entries = (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [url, size] = item.split("|").map((part) => part.trim());

      return {
        url,
        size: normalizeGallerySize(size)
      };
    })
    .filter((item) => item.url.length > 0);

  return {
    urls: entries.map((item) => item.url),
    sizes: entries.map((item) => item.size)
  };
}

function parseGallerySizes(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => normalizeGallerySize(value));
}

function parseGalleryDescriptions(values: FormDataEntryValue[], length: number) {
  const descriptions = values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim());

  return Array.from({ length }, (_, index) => descriptions[index] ?? "");
}

function toInteger(value: string | null) {
  const parsed = Number.parseInt(value ?? "0", 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseCoverDisplay(value: string | null): "thumbnail" | "fullscreen" {
  return value === "fullscreen" ? "fullscreen" : "thumbnail";
}

function getUploadExtension(fileName: string, contentType: string) {
  const extensionFromName = fileName.split(".").pop()?.trim().toLowerCase();

  if (extensionFromName && /^[a-z0-9]{2,5}$/.test(extensionFromName)) {
    return extensionFromName;
  }

  const extensionsByType: Record<string, string> = {
    "image/avif": "avif",
    "image/gif": "gif",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/svg+xml": "svg",
    "image/webp": "webp"
  };

  return extensionsByType[contentType] ?? "webp";
}

async function requireAdminSession() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAllowedAdminEmail(user.email)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return supabase;
}

export async function createProjectUploadTargetAction(input: {
  fileName: string;
  contentType: string;
  size: number;
  kind: "cover" | "gallery";
}): Promise<ProjectUploadTargetResult> {
  if (!hasSupabaseConfig()) {
    return { ok: false, message: "Supabase não está configurado neste ambiente." };
  }

  const supabase = await requireAdminSession();

  if (!input.contentType.startsWith("image/")) {
    return { ok: false, message: "O arquivo selecionado não é uma imagem válida." };
  }

  if (!Number.isFinite(input.size) || input.size <= 0 || input.size > MAX_PROJECT_IMAGE_BYTES) {
    return { ok: false, message: "Cada imagem deve ter no máximo 20 MB." };
  }

  const extension = getUploadExtension(input.fileName, input.contentType);
  const path = `uploads/${input.kind}/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await supabase.storage
    .from(PROJECT_ASSET_BUCKET)
    .createSignedUploadUrl(path);

  if (error) {
    return { ok: false, message: `Não foi possível preparar o upload: ${error.message}` };
  }

  return { ok: true, path: data.path, token: data.token };
}

export async function discardProjectUploadsAction(paths: string[]) {
  if (!hasSupabaseConfig()) {
    return;
  }

  const safePaths = paths.filter((path) => /^uploads\/(cover|gallery)\/[a-f0-9-]+\.[a-z0-9]{2,5}$/i.test(path));

  if (!safePaths.length) {
    return;
  }

  const supabase = await requireAdminSession();
  await supabase.storage.from(PROJECT_ASSET_BUCKET).remove(safePaths);
}

function getSaveErrorMessage(error: { code?: string; message?: string }) {
  if (error.code === "23505") {
    return "Já existe um projeto com esse endereço. Volte ao início e escolha outro slug.";
  }

  if (error.code === "42703" || error.code === "PGRST204") {
    return "O banco de dados ainda não possui todos os campos do projeto. Aplique as migrações do Supabase.";
  }

  return error.message?.trim()
    ? `Não foi possível salvar o projeto: ${error.message}`
    : "Não foi possível salvar o projeto. Tente novamente.";
}

export async function saveProjectAction(formData: FormData): Promise<SaveProjectResult> {
  if (!hasSupabaseConfig()) {
    return { ok: false, message: "Supabase não está configurado neste ambiente." };
  }

  const supabase = await requireAdminSession();

  try {
    const title = getRequiredString(formData, "title");
    const id = getOptionalString(formData, "id");
    const currentCoverUrl = getOptionalString(formData, "current_cover_image_url");
    const coverImageUrl = getOptionalString(formData, "cover_image_url") ?? currentCoverUrl ?? "/project-forge.svg";
    const gallery = parseGallery(getOptionalString(formData, "gallery_image_urls"));
    const submittedGallerySizes = parseGallerySizes(formData.getAll("gallery_image_sizes"));
    const gallerySizes = gallery.urls.map((_, index) => submittedGallerySizes[index] ?? gallery.sizes[index] ?? "medium");
    const galleryDescriptions = parseGalleryDescriptions(formData.getAll("gallery_image_descriptions"), gallery.urls.length);

    const payload = {
      title,
      slug: getOptionalString(formData, "slug") ?? slugify(title),
      description: getRequiredString(formData, "description"),
      cover_image_url: coverImageUrl,
      cover_display: parseCoverDisplay(getOptionalString(formData, "cover_display")),
      product_overview: getOptionalString(formData, "product_overview"),
      gallery_image_urls: gallery.urls,
      gallery_image_sizes: gallerySizes,
      gallery_image_descriptions: galleryDescriptions,
      video_url: getOptionalString(formData, "video_url"),
      product_role: getOptionalString(formData, "product_role"),
      product_features: parseTextList(getOptionalString(formData, "product_features")),
      product_results: parseTextList(getOptionalString(formData, "product_results")),
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
      return { ok: false, message: getSaveErrorMessage(error) };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível salvar o projeto."
    };
  }
}

export async function deleteProjectAction(formData: FormData) {
  const id = getOptionalString(formData, "id");

  if (!id) {
    redirect("/admin?error=missing-id");
  }

  const supabase = await requireAdminSession();

  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.code ?? "delete")}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?deleted=1");
}

export async function toggleFeaturedAction(formData: FormData) {
  const id = getOptionalString(formData, "id");
  const featured = formData.get("featured") === "true";

  if (!id) {
    redirect("/admin?error=missing-id");
  }

  const supabase = await requireAdminSession();

  const { error } = await supabase.from("projects").update({ featured: !featured }).eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent(error.code ?? "featured")}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?updated=1");
}

export async function signInAction(formData: FormData) {
  const email = getOptionalString(formData, "email");
  const password = getOptionalString(formData, "password");

  if (!email || !password) {
    redirect("/admin/login?error=missing");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=1");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!isAllowedAdminEmail(user?.email)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
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
