import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_EMAIL = "gabrielmcgoes@gmail.com";
const RESUME_BUCKET = "private-resume";

type ReviewPayload = {
  id?: unknown;
  action?: unknown;
  note?: unknown;
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

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSiteUrl(request: Request) {
  const origin = request.headers.get("origin") || "";

  if (origin === "https://pessoalportfolio.vercel.app" || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
    return origin;
  }

  return Deno.env.get("PUBLIC_SITE_URL") || "https://pessoalportfolio.vercel.app";
}

async function sendDecisionEmail(input: {
  request: Request;
  requestId: string;
  name: string;
  email: string;
  locale: "en" | "pt";
  action: "approve" | "reject" | "revoke";
  accessUrl?: string;
}) {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    return "not_configured" as const;
  }

  const isPortuguese = input.locale === "pt";
  const subjectByAction = {
    approve: isPortuguese ? "Acesso ao currículo de Gabriel Morgado" : "Access to Gabriel Morgado's resume",
    reject: isPortuguese ? "Atualização da solicitação de currículo" : "Resume request update",
    revoke: isPortuguese ? "Acesso ao currículo encerrado" : "Resume access ended"
  };
  const bodyByAction = {
    approve: isPortuguese
      ? `Olá, ${input.name}. Sua solicitação foi aprovada. O link abaixo fica disponível por 72 horas:\n\n${input.accessUrl}`
      : `Hello, ${input.name}. Your request was approved. The link below is available for 72 hours:\n\n${input.accessUrl}`,
    reject: isPortuguese
      ? `Olá, ${input.name}. No momento, sua solicitação de acesso ao currículo não foi aprovada.`
      : `Hello, ${input.name}. At this time, your request for resume access was not approved.`,
    revoke: isPortuguese
      ? `Olá, ${input.name}. O acesso temporário ao currículo foi encerrado.`
      : `Hello, ${input.name}. Temporary access to the resume has ended.`
  };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `portfolio-resume-${input.action}-${input.requestId}-${Date.now()}`
    },
    body: JSON.stringify({
      from: Deno.env.get("CONTACT_FROM_EMAIL") || "Gabriel Morgado Portfolio <onboarding@resend.dev>",
      to: [input.email],
      reply_to: Deno.env.get("CONTACT_TO_EMAIL") || ADMIN_EMAIL,
      subject: subjectByAction[input.action],
      text: bodyByAction[input.action]
    })
  });

  return response.ok ? "sent" as const : "failed" as const;
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
  const authorization = request.headers.get("authorization") || "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json(request, { code: "UNAUTHORIZED" }, 401);
  }

  const authClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: { user } } = await authClient.auth.getUser();

  if (user?.email?.toLowerCase() !== ADMIN_EMAIL) {
    return json(request, { code: "UNAUTHORIZED" }, 401);
  }

  let payload: ReviewPayload;

  try {
    payload = await request.json() as ReviewPayload;
  } catch {
    return json(request, { code: "INVALID" }, 400);
  }

  const id = typeof payload.id === "string" ? payload.id.trim() : "";
  const action = typeof payload.action === "string" ? payload.action : "";
  const note = typeof payload.note === "string" ? payload.note.trim().slice(0, 1000) : "";

  if (!/^[0-9a-f-]{36}$/i.test(id) || !["approve", "reject", "revoke", "delete", "note"].includes(action)) {
    return json(request, { code: "INVALID" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const { data: resumeRequest, error: requestError } = await supabase
    .from("resume_requests")
    .select("id,name,email,locale,resume_file_path")
    .eq("id", id)
    .maybeSingle();

  if (requestError || !resumeRequest) {
    return json(request, { code: "NOT_FOUND" }, 404);
  }

  if (action === "delete") {
    const { error } = await supabase.from("resume_requests").delete().eq("id", id);
    return error ? json(request, { code: "UPDATE_FAILED" }, 500) : json(request, { ok: true });
  }

  if (action === "note") {
    const { error } = await supabase.from("resume_requests").update({ admin_note: note || null }).eq("id", id);
    return error ? json(request, { code: "UPDATE_FAILED" }, 500) : json(request, { ok: true });
  }

  if (action === "approve") {
    const pathParts = resumeRequest.resume_file_path.split("/");
    const fileName = pathParts.pop() || "";
    const folder = pathParts.join("/");
    const { data: files, error: fileError } = await supabase.storage
      .from(RESUME_BUCKET)
      .list(folder, { search: fileName, limit: 10 });

    if (fileError || !files?.some((file) => file.name === fileName)) {
      return json(request, { code: "FILE_UNAVAILABLE" }, 409);
    }

    const accessToken = generateToken();
    const accessTokenHash = await hashValue(accessToken);
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    const accessUrl = `${getSiteUrl(request)}/resume/access#${accessToken}`;
    const notificationRequested = Boolean(Deno.env.get("RESEND_API_KEY"));
    const { error } = await supabase.from("resume_requests").update({
      status: "approved",
      access_token_hash: accessTokenHash,
      access_expires_at: expiresAt,
      approved_at: new Date().toISOString(),
      rejected_at: null,
      revoked_at: null,
      decision_notification_status: notificationRequested ? "pending" : "not_configured"
    }).eq("id", id);

    if (error) {
      return json(request, { code: "UPDATE_FAILED" }, 500);
    }

    let notificationStatus: "not_configured" | "sent" | "failed" = "not_configured";

    try {
      notificationStatus = await sendDecisionEmail({
        request,
        requestId: id,
        name: resumeRequest.name,
        email: resumeRequest.email,
        locale: resumeRequest.locale,
        action: "approve",
        accessUrl
      });
    } catch {
      notificationStatus = "failed";
    }

    await supabase.from("resume_requests").update({ decision_notification_status: notificationStatus }).eq("id", id);
    return json(request, { ok: true, accessUrl, expiresAt, notificationStatus });
  }

  const nextStatus = action === "reject" ? "rejected" : "revoked";
  const now = new Date().toISOString();
  const notificationRequested = Boolean(Deno.env.get("RESEND_API_KEY"));
  const { error } = await supabase.from("resume_requests").update({
    status: nextStatus,
    access_token_hash: null,
    access_expires_at: null,
    rejected_at: action === "reject" ? now : null,
    revoked_at: action === "revoke" ? now : null,
    decision_notification_status: notificationRequested ? "pending" : "not_configured"
  }).eq("id", id);

  if (error) {
    return json(request, { code: "UPDATE_FAILED" }, 500);
  }

  let notificationStatus: "not_configured" | "sent" | "failed" = "not_configured";

  try {
    notificationStatus = await sendDecisionEmail({
      request,
      requestId: id,
      name: resumeRequest.name,
      email: resumeRequest.email,
      locale: resumeRequest.locale,
      action: action as "reject" | "revoke"
    });
  } catch {
    notificationStatus = "failed";
  }

  await supabase.from("resume_requests").update({ decision_notification_status: notificationStatus }).eq("id", id);
  return json(request, { ok: true, notificationStatus });
});
