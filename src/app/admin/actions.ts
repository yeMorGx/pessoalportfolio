"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAllowedAdminEmail } from "@/lib/auth/admin";
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

async function uploadGalleryImages(formData: FormData) {
  const files = formData.getAll("gallery_images").filter((file): file is File => file instanceof File && file.size > 0);

  if (!files.length) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error("Supabase não está configurado.");
  }

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const extension = file.name.split(".").pop() ?? "webp";
    const path = `gallery/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("project-covers").upload(path, file, {
      cacheControl: "31536000",
      upsert: false
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("project-covers").getPublicUrl(path);
    uploadedUrls.push(data.publicUrl);
  }

  return uploadedUrls;
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

export async function saveProjectAction(formData: FormData) {
  if (!hasSupabaseConfig()) {
    throw new Error("Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY antes de salvar.");
  }

  const supabase = await requireAdminSession();

  const title = getRequiredString(formData, "title");
  const id = getOptionalString(formData, "id");
  const currentCoverUrl = getOptionalString(formData, "current_cover_image_url");
  const coverImageUrl = await uploadCover(formData, currentCoverUrl);
  const gallery = parseGallery(getOptionalString(formData, "gallery_image_urls"));
  const uploadedGalleryUrls = await uploadGalleryImages(formData);
  const submittedGallerySizes = parseGallerySizes(formData.getAll("gallery_image_sizes"));
  const galleryUrls = uploadedGalleryUrls?.length ? uploadedGalleryUrls : gallery.urls;
  const gallerySizes = galleryUrls.map((_, index) => submittedGallerySizes[index] ?? gallery.sizes[index] ?? "medium");
  const galleryDescriptions = parseGalleryDescriptions(formData.getAll("gallery_image_descriptions"), galleryUrls.length);

  const payload = {
    title,
    slug: getOptionalString(formData, "slug") ?? slugify(title),
    description: getRequiredString(formData, "description"),
    cover_image_url: coverImageUrl,
    cover_display: parseCoverDisplay(getOptionalString(formData, "cover_display")),
    product_overview: getOptionalString(formData, "product_overview"),
    gallery_image_urls: galleryUrls,
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
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
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
