import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_REQUEST_BYTES = 10 * 1024;
const CONTACT_TO_EMAIL = "gabrielmcgoes@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ResumeRequestPayload = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  jobTitle?: unknown;
  linkedinUrl?: unknown;
  purpose?: unknown;
  website?: unknown;
  locale?: unknown;
  startedAt?: unknown;
};

type ValidatedResumeRequest = {
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  linkedinUrl: string;
  purpose: string;
  locale: "en" | "pt";
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
    headers: {
      ...getCorsHeaders(request),
      "Cache-Control": "no-store",
      "Content-Type": "application/json"
    }
  });
}

function getText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLinkedIn(value: unknown) {
  const text = getText(value);

  if (!text) {
    return "";
  }

  try {
    const url = new URL(text);
    return url.protocol === "https:" && /(^|\.)linkedin\.com$/i.test(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

function validatePayload(payload: ResumeRequestPayload) {
  const name = getText(payload.name);
  const email = getText(payload.email).toLowerCase();
  const company = getText(payload.company);
  const jobTitle = getText(payload.jobTitle);
  const rawLinkedIn = getText(payload.linkedinUrl);
  const linkedinUrl = normalizeLinkedIn(payload.linkedinUrl);
  const purpose = getText(payload.purpose);
  const website = getText(payload.website);
  const locale = payload.locale === "pt" ? "pt" : "en";
  const startedAt = typeof payload.startedAt === "number" ? payload.startedAt : 0;
  const elapsed = Date.now() - startedAt;

  if (website) {
    return { ok: false as const, code: "SPAM" };
  }

  if (elapsed < 1500 || elapsed > 24 * 60 * 60 * 1000) {
    return { ok: false as const, code: "FORM_TIME" };
  }

  if (
    name.length < 2 || name.length > 80
    || email.length > 254 || !EMAIL_PATTERN.test(email)
    || company.length < 2 || company.length > 120
    || jobTitle.length < 2 || jobTitle.length > 120
    || purpose.length < 20 || purpose.length > 2000
    || (rawLinkedIn && !linkedinUrl)
  ) {
    return { ok: false as const, code: "INVALID" };
  }

  return { ok: true as const, value: { name, email, company, jobTitle, linkedinUrl, purpose, locale } };
}

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function hashValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashVisitor(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || forwardedFor
    || "unknown";
  const salt = Deno.env.get("CONTACT_RATE_LIMIT_SALT")
    || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    || "resume-rate-limit";

  return hashValue(`${salt}:${address}`);
}

async function sendAdminNotification(requestData: ValidatedResumeRequest, requestId: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    return "not_configured" as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `portfolio-resume-request-${requestId}`
    },
    body: JSON.stringify({
      from: Deno.env.get("CONTACT_FROM_EMAIL") || "Gabriel Morgado Portfolio <onboarding@resend.dev>",
      to: [Deno.env.get("CONTACT_TO_EMAIL") || CONTACT_TO_EMAIL],
      reply_to: requestData.email,
      subject: `[Portfólio] Solicitação de currículo — ${requestData.company}`,
      text: [
        "Nova solicitação de currículo",
        "",
        `Nome: ${requestData.name}`,
        `E-mail: ${requestData.email}`,
        `Empresa: ${requestData.company}`,
        `Cargo: ${requestData.jobTitle}`,
        `LinkedIn: ${requestData.linkedinUrl || "Não informado"}`,
        `Idioma: ${requestData.locale.toUpperCase()}`,
        "",
        requestData.purpose,
        "",
        "Revisar em: https://pessoalportfolio.vercel.app/admin/resume"
      ].join("\n")
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

  if (Number(request.headers.get("content-length") || 0) > MAX_REQUEST_BYTES) {
    return json(request, { code: "TOO_LARGE" }, 413);
  }

  let payload: ResumeRequestPayload;

  try {
    payload = await request.json() as ResumeRequestPayload;
  } catch {
    return json(request, { code: "INVALID" }, 400);
  }

  const validated = validatePayload(payload);

  if (!validated.ok) {
    return json(request, { code: validated.code }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json(request, { code: "UNAVAILABLE" }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  const statusToken = generateToken();
  const statusTokenHash = await hashValue(statusToken);
  const visitorHash = await hashVisitor(request);
  const notificationRequested = Boolean(Deno.env.get("RESEND_API_KEY"));
  const { data: requestId, error } = await supabase.rpc("submit_resume_request", {
    p_name: validated.value.name,
    p_email: validated.value.email,
    p_company: validated.value.company,
    p_job_title: validated.value.jobTitle,
    p_linkedin_url: validated.value.linkedinUrl,
    p_purpose: validated.value.purpose,
    p_locale: validated.value.locale,
    p_status_token_hash: statusTokenHash,
    p_visitor_hash: visitorHash,
    p_notification_requested: notificationRequested
  });

  if (error) {
    const isRateLimit = error.message.includes("RESUME_RATE_LIMIT");
    console.error("Resume request persistence failed", error.code);
    return json(request, { code: isRateLimit ? "RATE_LIMIT" : "PERSISTENCE_ERROR" }, isRateLimit ? 429 : 500);
  }

  if (notificationRequested && typeof requestId === "string") {
    let notificationStatus: "sent" | "failed" = "failed";

    try {
      notificationStatus = await sendAdminNotification(validated.value, requestId) === "sent" ? "sent" : "failed";
    } catch {
      notificationStatus = "failed";
    }

    await supabase
      .from("resume_requests")
      .update({ request_notification_status: notificationStatus })
      .eq("id", requestId);
  }

  return json(request, { ok: true, statusToken });
});
