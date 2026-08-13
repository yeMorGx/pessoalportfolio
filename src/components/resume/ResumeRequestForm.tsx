"use client";

import { CheckCircle2, Copy, ExternalLink, LoaderCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { resumeStatusPath, siteCopy, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getFunctionErrorCode } from "@/lib/supabase/functionErrors";

type SubmitState = "idle" | "sending" | "success" | "error";

const inputClassName = "h-12 w-full border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0";

export function ResumeRequestForm({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale].resume.form;
  const startedAtRef = useRef(Date.now());
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [statusToken, setStatusToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const statusHref = statusToken ? `${resumeStatusPath(locale)}?token=${encodeURIComponent(statusToken)}` : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("sending");
    setErrorMessage("");

    const formData = new FormData(event.currentTarget);

    try {
      const supabase = createSupabaseBrowserClient();

      if (!supabase) {
        throw new Error(copy.error);
      }

      const { data, error } = await supabase.functions.invoke("submit-resume-request", {
        body: {
          name: formData.get("name"),
          email: formData.get("email"),
          company: formData.get("company"),
          jobTitle: formData.get("jobTitle"),
          linkedinUrl: formData.get("linkedinUrl"),
          purpose: formData.get("purpose"),
          website: formData.get("website"),
          locale,
          startedAt: startedAtRef.current
        }
      });

      if (error || !data?.statusToken) {
        const code = await getFunctionErrorCode(error, data);
        throw new Error(code === "RATE_LIMIT" ? copy.rateLimit : copy.error);
      }

      setStatusToken(data.statusToken);
      setSubmitState("success");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : copy.error);
      setSubmitState("error");
    }
  }

  async function copyTrackingLink() {
    if (!statusHref) {
      return;
    }

    await navigator.clipboard.writeText(`${window.location.origin}${statusHref}`);
    setCopied(true);
  }

  if (submitState === "success") {
    return (
      <div className="border border-ink/15 bg-white/30 p-6 sm:p-8" aria-live="polite">
        <CheckCircle2 size={24} className="text-emerald-700" />
        <h2 className="mt-5 font-display text-2xl font-semibold text-ink">{copy.success}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink/60">{copy.trackingCode}</p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href={statusHref} className="inline-flex h-11 items-center justify-center gap-2 bg-ink px-4 text-sm font-semibold text-ceramic transition hover:bg-coral">
            <ExternalLink size={15} />
            {copy.track}
          </Link>
          <button type="button" onClick={copyTrackingLink} className="inline-flex h-11 items-center justify-center gap-2 border border-ink/20 px-4 text-sm font-semibold text-ink transition hover:border-coral hover:text-coral">
            <Copy size={15} />
            {copied ? "OK" : locale === "pt" ? "Copiar link" : "Copy link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative grid gap-x-5 gap-y-5 sm:grid-cols-2">
      <div className="space-y-2">
        <label htmlFor="resume-name" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.name}</label>
        <input id="resume-name" name="name" autoComplete="name" minLength={2} maxLength={80} required placeholder={copy.namePlaceholder} className={inputClassName} />
      </div>
      <div className="space-y-2">
        <label htmlFor="resume-email" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.email}</label>
        <input id="resume-email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder={copy.emailPlaceholder} className={inputClassName} />
      </div>
      <div className="space-y-2">
        <label htmlFor="resume-company" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.company}</label>
        <input id="resume-company" name="company" autoComplete="organization" minLength={2} maxLength={120} required placeholder={copy.companyPlaceholder} className={inputClassName} />
      </div>
      <div className="space-y-2">
        <label htmlFor="resume-role" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.jobTitle}</label>
        <input id="resume-role" name="jobTitle" autoComplete="organization-title" minLength={2} maxLength={120} required placeholder={copy.jobTitlePlaceholder} className={inputClassName} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="resume-linkedin" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.linkedin}</label>
        <input id="resume-linkedin" name="linkedinUrl" type="url" inputMode="url" maxLength={300} placeholder={copy.linkedinPlaceholder} className={inputClassName} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="resume-purpose" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.purpose}</label>
        <textarea id="resume-purpose" name="purpose" rows={5} minLength={20} maxLength={2000} required placeholder={copy.purposePlaceholder} className="w-full resize-y border-x-0 border-b border-t-0 border-ink/20 bg-transparent px-0 py-3 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-coral focus:ring-0" />
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="resume-website">Website</label>
        <input id="resume-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex min-h-14 flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-ink/45">{copy.privacy}</p>
        <button type="submit" disabled={submitState === "sending"} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 bg-ink px-5 text-sm font-semibold text-ceramic transition hover:bg-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-wait disabled:opacity-65">
          {submitState === "sending" ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
          {submitState === "sending" ? copy.sending : copy.submit}
        </button>
      </div>

      <div className="min-h-6 sm:col-span-2" aria-live="polite">
        {submitState === "error" ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
      </div>
    </form>
  );
}
