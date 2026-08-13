import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { ResumeRequestForm } from "@/components/resume/ResumeRequestForm";
import { LanguageSwitch } from "@/components/ui/LanguageSwitch";
import { homePath, resumePath, siteCopy, type Locale } from "@/lib/i18n";

export function ResumeRequestPage({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale].resume;

  return (
    <main lang={locale === "pt" ? "pt-BR" : "en"} className="min-h-screen bg-ceramic text-ink">
      <header className="border-b border-ink/15 bg-ink text-ceramic">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href={homePath(locale)} aria-label={copy.back} className="flex items-center gap-3 text-sm font-semibold">
            <Image src="/logo.svg" alt="" width={24} height={24} />
            <span>Gabriel Morgado</span>
          </Link>
          <LanguageSwitch locale={locale} englishHref={resumePath("en")} portugueseHref={resumePath("pt")} />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <Link href={homePath(locale)} className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase text-ink/50 transition hover:text-coral">
          <ArrowLeft size={14} />
          {copy.back}
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <section>
            <p className="font-mono text-[0.65rem] uppercase text-coral">{copy.eyebrow}</p>
            <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.02] sm:text-5xl lg:text-6xl">{copy.heading}</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-ink/65">{copy.body}</p>

            <div className="mt-10 border-t border-ink/15">
              {copy.steps.map(([number, title, body]) => (
                <div key={number} className="grid grid-cols-[2.5rem_1fr] gap-3 border-b border-ink/15 py-5">
                  <span className="font-mono text-[0.6rem] text-coral">{number}</span>
                  <div>
                    <h2 className="text-sm font-semibold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink/55">{body}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 flex items-center gap-2 font-mono text-[0.58rem] uppercase text-ink/45">
              <LockKeyhole size={13} />
              {locale === "pt" ? "PDF privado / acesso temporário" : "Private PDF / temporary access"}
            </p>
          </section>

          <section className="border-t-2 border-ink bg-white/35 px-0 py-7 sm:px-7 lg:py-9" aria-label={copy.form.submit}>
            <ResumeRequestForm locale={locale} />
          </section>
        </div>
      </div>
    </main>
  );
}
