import { createClient } from "npm:@supabase/supabase-js@2";

const RESUME_BUCKET = "private-resume";
const RESUME_FILE_PATH = "current/gabriel-morgado-resume.pdf";

type FileActionPayload = {
  action?: unknown;
};

function getCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  const isAllowedOrigin = origin === "https://pessoalportfolio.vercel.app"
    || /^https:\/\/pessoalportfolio-[a-z0-9-]+\.vercel\.app$/.test(origin)
    || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "https://pessoalportfolio.vercel.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function json(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Cache-Control": "no-store", "Content-Type": "application/json" }
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }

  if (request.method !== "POST") {
    return json(request, { code: "METHOD_NOT_ALLOWED" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = Deno.env.get("ADMIN_EMAIL")?.trim().toLowerCase();
  const authorization = request.headers.get("authorization") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !adminEmail || !authorization) {
    return json(request, { code: "UNAUTHORIZED" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: { user } } = await authClient.auth.getUser();

  if (!user || user.email?.trim().toLowerCase() !== adminEmail) {
    return json(request, { code: "UNAUTHORIZED" }, 401);
  }

  let payload: FileActionPayload;

  try {
    payload = await request.json() as FileActionPayload;
  } catch {
    return json(request, { code: "INVALID" }, 400);
  }

  const action = typeof payload.action === "string" ? payload.action : "status";

  if (!["status", "create-upload", "remove"].includes(action)) {
    return json(request, { code: "INVALID" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { error: adminError } = await supabase
    .from("portfolio_admins")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  if (adminError) {
    return json(request, { code: "ADMIN_SETUP_FAILED" }, 500);
  }

  if (action === "create-upload") {
    const { data, error } = await supabase.storage
      .from(RESUME_BUCKET)
      .createSignedUploadUrl(RESUME_FILE_PATH, { upsert: true });

    if (error || !data) {
      return json(request, { code: "UPLOAD_SETUP_FAILED" }, 500);
    }

    return json(request, { ok: true, path: data.path, token: data.token });
  }

  if (action === "remove") {
    const { error } = await supabase.storage.from(RESUME_BUCKET).remove([RESUME_FILE_PATH]);
    return error ? json(request, { code: "REMOVE_FAILED" }, 500) : json(request, { ok: true });
  }

  const { data: files, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .list("current", { search: "gabriel-morgado-resume.pdf", limit: 10 });
  const file = files?.find((item) => item.name === "gabriel-morgado-resume.pdf");

  if (error || !file) {
    return json(request, { ok: true, available: false, size: null, updatedAt: null });
  }

  return json(request, {
    ok: true,
    available: true,
    size: typeof file.metadata?.size === "number" ? file.metadata.size : null,
    updatedAt: file.updated_at ?? file.created_at ?? null
  });
});
