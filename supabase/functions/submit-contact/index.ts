import { createClient } from "npm:@supabase/supabase-js@2";

const MAX_REQUEST_BYTES = 12 * 1024;
const CONTACT_TO_EMAIL = "gabrielmcgoes@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown;
  locale?: unknown;
  startedAt?: unknown;
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

function validatePayload(payload: ContactPayload) {
  const name = getText(payload.name);
  const email = getText(payload.email).toLowerCase();
  const subject = getText(payload.subject);
  const message = getText(payload.message);
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
    || subject.length < 3 || subject.length > 120
    || message.length < 20 || message.length > 4000
  ) {
    return { ok: false as const, code: "INVALID" };
  }

  return { ok: true as const, value: { name, email, subject, message, locale } };
}

async function hashVisitor(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = request.headers.get("cf-connecting-ip")
    || request.headers.get("x-real-ip")
    || forwardedFor
    || "unknown";
  const salt = Deno.env.get("CONTACT_RATE_LIMIT_SALT")
    || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    || "contact-rate-limit";
  const bytes = new TextEncoder().encode(`${salt}:${address}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function buildNotificationText(contact: { name: string; email: string; subject: string; message: string; locale: string }) {
  return [
    "Nova mensagem pelo portfólio",
    "",
    `Nome: ${contact.name}`,
    `E-mail: ${contact.email}`,
    `Idioma: ${contact.locale.toUpperCase()}`,
    `Assunto: ${contact.subject}`,
    "",
    contact.message
  ].join("\n");
}

async function sendNotification(contact: { name: string; email: string; subject: string; message: string; locale: string }, messageId: string) {
  const apiKey = Deno.env.get("RESEND_API_KEY");

  if (!apiKey) {
    return "not_configured" as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `portfolio-contact-${messageId}`
    },
    body: JSON.stringify({
      from: Deno.env.get("CONTACT_FROM_EMAIL") || "Gabriel Morgado Portfolio <onboarding@resend.dev>",
      to: [Deno.env.get("CONTACT_TO_EMAIL") || CONTACT_TO_EMAIL],
      reply_to: contact.email,
      subject: `[Portfólio] ${contact.subject}`,
      text: buildNotificationText(contact)
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

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > MAX_REQUEST_BYTES) {
    return json(request, { code: "TOO_LARGE" }, 413);
  }

  let payload: ContactPayload;

  try {
    payload = await request.json() as ContactPayload;
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
  const visitorHash = await hashVisitor(request);
  const notificationRequested = Boolean(Deno.env.get("RESEND_API_KEY"));
  const { data: messageId, error } = await supabase.rpc("submit_contact_message", {
    p_name: validated.value.name,
    p_email: validated.value.email,
    p_subject: validated.value.subject,
    p_message: validated.value.message,
    p_locale: validated.value.locale,
    p_visitor_hash: visitorHash,
    p_notification_requested: notificationRequested
  });

  if (error) {
    const isRateLimit = error.message.includes("CONTACT_RATE_LIMIT");
    console.error("Contact persistence failed", error.code);
    return json(
      request,
      { code: isRateLimit ? "RATE_LIMIT" : "PERSISTENCE_ERROR" },
      isRateLimit ? 429 : 500
    );
  }

  if (notificationRequested && typeof messageId === "string") {
    let notificationStatus: "sent" | "failed" = "failed";

    try {
      notificationStatus = await sendNotification(validated.value, messageId) === "sent" ? "sent" : "failed";
    } catch {
      notificationStatus = "failed";
    }

    await supabase
      .from("contact_messages")
      .update({
        notification_status: notificationStatus,
        notification_sent_at: notificationStatus === "sent" ? new Date().toISOString() : null
      })
      .eq("id", messageId);
  }

  return json(request, { ok: true });
});
