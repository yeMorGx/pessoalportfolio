import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ResumeStatusPanel } from "@/components/resume/ResumeStatusPanel";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { homePath, resumeStatusPath, siteCopy, type Locale } from "@/lib/i18n";

export function ResumeStatusPage({ locale, token }: { locale: Locale; token: string }) {
  const copy = siteCopy[locale].resume;
  const query = token ? `?token=${encodeURIComponent(token)}` : "";

  return (
    <main lang={locale === "pt" ? "pt-BR" : "en"} className="min-h-screen bg-ceramic text-ink">
      <header className="border-b border-white/10 bg-ink text-ceramic">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href={homePath(locale)} className="flex items-center gap-3 text-sm font-semibold"><Image src="/logo.svg" alt="" width={24} height={24} />Gabriel Morgado</Link>
          <LanguageSwitch locale={locale} englishHref={`${resumeStatusPath("en")}${query}`} portugueseHref={`${resumeStatusPath("pt")}${query}`} />
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
        <Link href={homePath(locale)} className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase text-ink/50 transition hover:text-coral"><ArrowLeft size={14} />{copy.back}</Link>
        <div className="mt-10 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="font-mono text-[0.65rem] uppercase text-coral">{copy.status.eyebrow}</p>
            <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">{copy.status.heading}</h1>
          </div>
          <section className="border-t-2 border-ink bg-white/35 px-0 py-7 sm:px-7"><ResumeStatusPanel locale={locale} initialToken={token} /></section>
        </div>
      </div>
    </main>
  );
}
