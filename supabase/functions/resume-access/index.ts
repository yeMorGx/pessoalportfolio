import { createClient } from "npm:@supabase/supabase-js@2";

type AccessPayload = {
  action?: unknown;
  token?: unknown;
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

async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders(request) });
  }

  if (request.method !== "POST") {
    return json(request, { code: "METHOD_NOT_ALLOWED" }, 405);
  }

  let payload: AccessPayload;

  try {
    payload = await request.json() as AccessPayload;
  } catch {
    return json(request, { code: "INVALID" }, 400);
  }

  const action = payload.action === "download" ? "download" : "status";
  const token = typeof payload.token === "string" ? payload.token.trim() : "";

  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) {
    return json(request, { code: "INVALID_TOKEN" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(request, { code: "UNAVAILABLE" }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const tokenHash = await hashValue(token);

  if (action === "status") {
    const { data, error } = await supabase
      .from("resume_requests")
      .select("status,locale,access_expires_at,created_at,updated_at")
      .eq("status_token_hash", tokenHash)
      .maybeSingle();

    if (error || !data) {
      return json(request, { code: "NOT_FOUND" }, 404);
    }

    const expired = data.status === "approved"
      && data.access_expires_at
      && new Date(data.access_expires_at).getTime() <= Date.now();

    return json(request, {
      ok: true,
      status: expired ? "expired" : data.status,
      locale: data.locale,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      accessExpiresAt: data.access_expires_at
    });
  }

  const { data, error } = await supabase
    .from("resume_requests")
    .select("id,status,locale,access_expires_at,resume_file_path,download_count")
    .eq("access_token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) {
    return json(request, { code: "NOT_FOUND" }, 404);
  }

  if (data.status !== "approved") {
    return json(request, { code: data.status === "revoked" ? "REVOKED" : "NOT_APPROVED", locale: data.locale }, 403);
  }

  if (!data.access_expires_at || new Date(data.access_expires_at).getTime() <= Date.now()) {
    return json(request, { code: "EXPIRED", locale: data.locale }, 410);
  }

  const { data: signedData, error: signedError } = await supabase.storage
    .from("private-resume")
    .createSignedUrl(data.resume_file_path, 60, { download: "Gabriel-Morgado-Resume.pdf" });

  if (signedError || !signedData?.signedUrl) {
    return json(request, { code: "FILE_UNAVAILABLE", locale: data.locale }, 503);
  }

  await supabase
    .from("resume_requests")
    .update({ last_download_at: new Date().toISOString(), download_count: data.download_count + 1 })
    .eq("id", data.id);

  return json(request, { ok: true, signedUrl: signedData.signedUrl, locale: data.locale });
});
