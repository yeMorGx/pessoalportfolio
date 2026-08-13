"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { siteCopy, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type SubmitState = "idle" | "sending" | "success" | "error";

async function getFunctionErrorCode(error: unknown, data: unknown) {
  if (data && typeof data === "object" && "code" in data && typeof data.code === "string") {
    return data.code;
  }

  if (error && typeof error === "object" && "context" in error) {
    const context = (error as { context?: unknown }).context;

    if (context instanceof Response) {
      try {
        const body = await context.clone().json() as { code?: unknown };
        return typeof body.code === "string" ? body.code : undefined;
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale].contact.form;
  const startedAtRef = useRef(Date.now());
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error(copy.error);
      }

      const { data, error } = await supabase.functions.invoke("submit-contact", {
        body: {
          name: formData.get("name"),
          email: formData.get("email"),
          subject: formData.get("subject"),
          message: formData.get("message"),
          website: formData.get("website"),
          locale,
          startedAt: startedAtRef.current
        }
      });

      if (error) {
        const code = await getFunctionErrorCode(error, data);
        throw new Error(code === "RATE_LIMIT" ? copy.rateLimit : copy.error);
      }

      form.reset();
      startedAtRef.current = Date.now();
      setSubmitState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.error);
      setSubmitState("error");
    }
  }

  return (
    <form id="contact-form" onSubmit={handleSubmit} className="relative grid gap-x-5 gap-y-5 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="contact-name" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.name}</label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          minLength={2}
          maxLength={80}
          required
          placeholder={copy.namePlaceholder}
          className="h-12 w-full border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="contact-email" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.email}</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          placeholder={copy.emailPlaceholder}
          className="h-12 w-full border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="contact-subject" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.subject}</label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          minLength={3}
          maxLength={120}
          required
          placeholder={copy.subjectPlaceholder}
          className="h-12 w-full border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0"
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="contact-message" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.message}</label>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          minLength={20}
          maxLength={4000}
          required
          placeholder={copy.messagePlaceholder}
          className="w-full resize-y border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0"
        />
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex min-h-14 flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-ink/45">{copy.privacy}</p>
        <button
          type="submit"
          disabled={submitState === "sending"}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-ink px-5 text-sm font-semibold text-ceramic transition-colors hover:bg-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-wait disabled:opacity-65"
        >
          {submitState === "sending" ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
          {submitState === "sending" ? copy.sending : copy.submit}
        </button>
      </div>

      <div className="min-h-6 sm:col-span-2" aria-live="polite">
        {submitState === "success" ? (
          <p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={16} />
            {copy.success}
          </p>
        ) : null}
        {submitState === "error" ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
      </div>
    </form>
  );
}
