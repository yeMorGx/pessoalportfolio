"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { ContactForm } from "@/components/sections/ContactForm";
import { FooterLocation } from "@/components/sections/FooterLocation";
import { FooterWordmark } from "@/components/sections/FooterWordmark";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { siteCopy, type Locale } from "@/lib/i18n";

const contactLinks = [
  { href: "mailto:gabrielmcgoes@gmail.com", label: "Email", icon: Mail },
  { href: "https://github.com/yeMorGx", label: "GitHub", icon: Github },
  { href: "https://www.linkedin.com/in/gabrielmcgoes", label: "LinkedIn", icon: Linkedin }
];

export function Contact({ locale }: { locale: Locale }) {
  const ref = useScrollReveal<HTMLElement>();
  const copy = siteCopy[locale].contact;

  return (
    <section id="contato" ref={ref} className="bg-ceramic px-5 py-16 text-ink sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center justify-between border-b border-ink/15 pb-4 font-mono text-[0.65rem] uppercase text-ink/55">
          <span>{copy.sectionLabel}</span>
          <span>04</span>
        </div>

        <div className="grid gap-12 py-9 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16 lg:py-14">
          <div data-reveal>
            <p className="font-mono text-[0.68rem] uppercase text-coral">{copy.eyebrow}</p>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-semibold leading-[1.06] sm:text-4xl lg:text-5xl">{copy.heading}</h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink/65">{copy.body}</p>
          </div>

          <div data-reveal>
            <ContactForm locale={locale} />
          </div>
        </div>

        <div data-reveal className="grid border-y border-ink/15 sm:grid-cols-3">
          {contactLinks.map(({ href, label, icon: Icon }, index) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className={`group flex min-h-16 items-center justify-between py-4 text-sm font-semibold transition-colors hover:text-coral sm:px-5 sm:first:pl-0 sm:last:pr-0 ${index > 0 ? "border-t border-ink/15 sm:border-l sm:border-t-0" : ""}`}
            >
              <span className="flex items-center gap-3"><Icon size={16} />{label}</span>
              <PortfolioIcon name="link" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
        </div>

        <FooterLocation locale={locale} />

        <FooterWordmark locale={locale} />

        <footer data-reveal className="mt-5 flex flex-col gap-3 font-mono text-[0.6rem] uppercase text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <span>Gabriel Morgado / Full-stack developer</span>
          <a href="https://www.google.com/maps/search/?api=1&query=-23.962,-46.363" target="_blank" rel="noreferrer" className="transition-colors hover:text-coral">{copy.location}</a>
        </footer>
      </div>
    </section>
  );
}
