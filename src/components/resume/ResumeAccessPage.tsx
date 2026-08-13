"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getFunctionErrorCode } from "@/lib/supabase/functionErrors";

export function ResumeAccessPage() {
  const [locale, setLocale] = useState<"en" | "pt">("pt");
  const [loading, setLoading] = useState(false);
  const [errorCode, setErrorCode] = useState("");
  const copy = locale === "pt" ? {
    back: "Voltar ao portfólio",
    eyebrow: "Documento protegido",
    heading: "Acesso privado ao currículo",
    body: "Este link é pessoal, temporário e não deve ser encaminhado. O endereço de download gerado expira após 60 segundos.",
    download: "Baixar PDF",
    preparing: "Preparando download",
    expired: "Este acesso expirou ou foi revogado.",
    unavailable: "O currículo está temporariamente indisponível. Entre em contato com Gabriel."
  } : {
    back: "Back to portfolio",
    eyebrow: "Protected document",
    heading: "Private resume access",
    body: "This link is personal, temporary and should not be forwarded. The generated download address expires after 60 seconds.",
    download: "Download PDF",
    preparing: "Preparing download",
    expired: "This access has expired or was revoked.",
    unavailable: "The resume is temporarily unavailable. Please contact Gabriel."
  };

  async function downloadResume() {
    setLoading(true);
    setErrorCode("");

    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setErrorCode("UNAVAILABLE");
      setLoading(false);
      return;
    }

    const token = window.location.hash.slice(1).trim();
    const { data, error } = await supabase.functions.invoke("resume-access", {
      body: { action: "download", token }
    });

    if (data?.locale === "en" || data?.locale === "pt") {
      setLocale(data.locale);
    }

    if (error || !data?.signedUrl) {
      setErrorCode((await getFunctionErrorCode(error, data)) || "UNAVAILABLE");
    } else {
      window.location.assign(data.signedUrl);
    }

    setLoading(false);
  }

  const expired = ["EXPIRED", "REVOKED", "NOT_APPROVED", "NOT_FOUND", "INVALID_TOKEN"].includes(errorCode);

  return (
    <main lang={locale === "pt" ? "pt-BR" : "en"} className="flex min-h-screen items-center bg-ink px-5 py-12 text-ceramic sm:px-8">
      <div className="mx-auto w-full max-w-3xl border border-white/12 bg-white/[0.025]">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-8">
          <Link href={locale === "pt" ? "/pt" : "/"} className="flex items-center gap-3 text-sm font-semibold"><Image src="/logo.svg" alt="" width={24} height={24} />Gabriel Morgado</Link>
          <LockKeyhole size={17} className="text-mint" />
        </header>
        <div className="px-5 py-10 sm:px-8 sm:py-14">
          <p className="font-mono text-[0.62rem] uppercase text-mint">{copy.eyebrow}</p>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold sm:text-5xl">{copy.heading}</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">{copy.body}</p>
          <button type="button" onClick={downloadResume} disabled={loading} className="mt-8 inline-flex h-12 items-center justify-center gap-2 bg-mint px-5 text-sm font-semibold text-ink transition hover:bg-white disabled:cursor-wait disabled:opacity-65">
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? copy.preparing : copy.download}
          </button>
          {errorCode ? <p className="mt-5 text-sm font-medium text-coral" aria-live="polite">{expired ? copy.expired : copy.unavailable}</p> : null}
        </div>
      </div>
    </main>
  );
}
