"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { siteCopy, type Locale } from "@/lib/i18n";

export function About({ locale }: { locale: Locale }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const copy = siteCopy[locale].about;

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-about-reveal]",
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: section, start: "top 76%", once: true }
        }
      );

      gsap.fromTo(
        "[data-about-photo]",
        { yPercent: -4, scale: 1.04 },
        {
          yPercent: 5,
          scale: 1.07,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true }
        }
      );
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section id="sobre" ref={sectionRef} className="bg-ceramic px-5 py-16 text-ink sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-about-reveal className="flex items-center justify-between border-b border-ink/15 pb-4 font-mono text-[0.65rem] uppercase text-ink/55">
          <span>{copy.sectionLabel}</span>
          <span>01</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div data-about-reveal className="relative aspect-[4/5] overflow-hidden bg-graphite sm:aspect-[5/6] lg:col-span-5 lg:aspect-auto lg:min-h-[40rem]">
            <Image
              data-about-photo
              src="/gabriel-morgado.jpg"
              alt={copy.portraitAlt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-[center_66%] will-change-transform"
            />
            <div className="absolute bottom-0 left-0 flex items-center gap-2 bg-ink px-4 py-3 font-mono text-[0.62rem] uppercase text-ceramic">
              <span className="h-1.5 w-1.5 bg-mint" />
              {copy.availability}
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <p data-about-reveal className="font-mono text-[0.68rem] uppercase text-ink/55">{copy.eyebrow}</p>
            <h2 data-about-reveal className="mt-5 max-w-3xl font-display text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">
              {copy.heading}
            </h2>
            <p data-about-reveal className="mt-6 max-w-2xl text-base leading-7 text-ink/70 sm:text-lg sm:leading-8">
              {copy.body}
            </p>

            <div className="mt-9 border-t border-ink/15">
              {copy.capabilities.map(([title, description], index) => (
                <div data-about-reveal key={title} className="grid gap-2 border-b border-ink/15 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[0.58rem] text-coral">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-sm font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm leading-6 text-ink/65">{description}</p>
                </div>
              ))}
            </div>

            <a data-about-reveal href="#projetos" className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-ink">
              {copy.work}
              <PortfolioIcon name="down" className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
