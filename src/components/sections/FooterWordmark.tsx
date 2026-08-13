"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { siteCopy, type Locale } from "@/lib/i18n";

const wordmark = "MORGADO".split("");

export function FooterWordmark({ locale }: { locale: Locale }) {
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const copy = siteCopy[locale].wordmark;

  useEffect(() => {
    const scope = scopeRef.current;

    if (!scope || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      const letters = scope.querySelectorAll("[data-wordmark-letter]");
      const marker = scope.querySelector("[data-wordmark-marker]");
      const rail = scope.querySelector<HTMLElement>("[data-wordmark-rail]");

      gsap.fromTo(
        letters,
        { yPercent: 115, rotateX: -18 },
        {
          yPercent: 0,
          rotateX: 0,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.045,
          scrollTrigger: {
            trigger: scope,
            start: "top 96%",
            once: true
          }
        }
      );

      if (marker && rail) {
        gsap.fromTo(
          marker,
          { x: 0 },
          {
            x: () => Math.max(0, rail.clientWidth - 8),
            ease: "none",
            scrollTrigger: {
              trigger: scope,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.7,
              invalidateOnRefresh: true
            }
          }
        );
      }
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <div ref={scopeRef} className="mt-14 border-t border-ink/15 pt-4 sm:mt-20 sm:pt-5">
      <div className="flex items-center justify-between gap-4 font-mono text-[0.58rem] uppercase text-ink/45 sm:text-[0.62rem]">
        <span>{copy.signature}</span>
        <span className="flex items-center gap-2 text-right">
          <span className="h-1.5 w-1.5 shrink-0 bg-mint ring-1 ring-ink/15" />
          <span>{copy.open}<span className="hidden sm:inline"> / {copy.projects}</span></span>
        </span>
      </div>

      <div className="relative mt-5 h-11 overflow-hidden pt-1 [perspective:900px] sm:mt-7 sm:h-16 md:h-[4.5rem] lg:h-[7.5rem] xl:h-[10.5rem]">
        <span className="sr-only">Morgado</span>
        <div aria-hidden="true" className="flex items-end justify-between font-display text-5xl font-semibold leading-[0.9] text-ink [mask-image:linear-gradient(to_bottom,#000_0%,#000_52%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_0%,#000_52%,transparent_100%)] sm:text-7xl md:text-8xl lg:text-[8.5rem] xl:text-[13rem]">
          {wordmark.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              data-wordmark-letter
              className={`block origin-bottom ${letter === "G" ? "text-coral" : ""}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div data-wordmark-rail className="relative h-px bg-ink/15">
        <span data-wordmark-marker className="absolute -top-[3px] left-0 h-[7px] w-2 bg-coral" />
      </div>
    </div>
  );
}
