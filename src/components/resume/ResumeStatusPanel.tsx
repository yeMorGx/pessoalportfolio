"use client";

import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, Search, type LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { siteCopy, type Locale } from "@/lib/i18n";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getFunctionErrorCode } from "@/lib/supabase/functionErrors";

type ResumeRequestStatus = "pending" | "approved" | "rejected" | "revoked" | "expired";

export function ResumeStatusPanel({ locale, initialToken }: { locale: Locale; initialToken: string }) {
  const copy = siteCopy[locale].resume.status;
  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<ResumeRequestStatus | null>(null);
  const [loading, setLoading] = useState(Boolean(initialToken));
  const [errorMessage, setErrorMessage] = useState("");

  async function checkStatus(value: string) {
    const normalizedToken = value.trim();

    if (!normalizedToken) {
      setErrorMessage(copy.notFound);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setStatus(null);

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setErrorMessage(copy.notFound);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke("resume-access", {
      body: { action: "status", token: normalizedToken }
    });

    if (error || !data?.status) {
      await getFunctionErrorCode(error, data);
      setErrorMessage(copy.notFound);
    } else {
      setStatus(data.status as ResumeRequestStatus);
    }

    setLoading(false);
  }

  useEffect(() => {
    if (initialToken) {
      void checkStatus(initialToken);
    }
    // The initial token is intentionally checked only once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void checkStatus(token);
  }

  const statusMap: Record<ResumeRequestStatus, { title: string; body: string; Icon: LucideIcon; color: string }> = {
    pending: { title: copy.pending, body: copy.pendingBody, Icon: Clock3, color: "text-amber-700" },
    approved: { title: copy.approved, body: copy.approvedBody, Icon: CheckCircle2, color: "text-emerald-700" },
    rejected: { title: copy.rejected, body: copy.rejectedBody, Icon: AlertCircle, color: "text-red-700" },
    revoked: { title: copy.revoked, body: copy.revokedBody, Icon: AlertCircle, color: "text-red-700" },
    expired: { title: copy.expired, body: copy.expiredBody, Icon: Clock3, color: "text-amber-700" }
  };
  const statusContent = status ? statusMap[status] : null;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="resume-status-token" className="font-mono text-[0.6rem] uppercase text-ink/55">{copy.tokenLabel}</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input id="resume-status-token" value={token} onChange={(event) => setToken(event.target.value)} placeholder={copy.tokenPlaceholder} autoComplete="off" className="h-12 min-w-0 flex-1 border border-ink/20 bg-transparent px-3 font-mono text-xs text-ink outline-none focus:border-coral" />
          <button type="submit" disabled={loading} className="inline-flex h-12 items-center justify-center gap-2 bg-ink px-5 text-sm font-semibold text-ceramic transition hover:bg-coral disabled:cursor-wait disabled:opacity-65">
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? copy.loading : copy.check}
          </button>
        </div>
      </form>

      <div className="mt-7 min-h-32 border-t border-ink/15 pt-6" aria-live="polite">
        {statusContent ? (
          <div className={statusContent.color}>
            <statusContent.Icon size={22} />
            <h2 className="mt-3 font-display text-2xl font-semibold">{statusContent.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-ink/60">{statusContent.body}</p>
          </div>
        ) : null}
        {errorMessage ? <p className="flex items-start gap-2 text-sm font-medium text-red-700"><AlertCircle size={16} className="mt-0.5 shrink-0" />{errorMessage}</p> : null}
      </div>
    </div>
  );
}
