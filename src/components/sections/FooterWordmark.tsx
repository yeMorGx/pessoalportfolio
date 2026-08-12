"use client";

import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const wordmark = "MORGADO".split("");

export function FooterWordmark() {
  const scopeRef = useRef<HTMLDivElement | null>(null);

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
    <div ref={scopeRef} className="mt-14 border-y border-ink/15 py-4 sm:mt-20 sm:py-5">
      <div className="flex items-center justify-between gap-4 font-mono text-[0.58rem] uppercase text-ink/45 sm:text-[0.62rem]">
        <span>Assinatura / Portfólio</span>
        <span className="flex items-center gap-2 text-right">
          <span className="h-1.5 w-1.5 shrink-0 bg-mint ring-1 ring-ink/15" />
          <span>Agenda aberta<span className="hidden sm:inline"> / Novos projetos</span></span>
        </span>
      </div>

      <div className="relative mt-5 overflow-hidden pt-1 [perspective:900px] sm:mt-7">
        <span className="sr-only">Morgado</span>
        <div aria-hidden="true" className="flex items-end justify-between font-display text-5xl font-semibold leading-[0.9] text-ink sm:text-7xl sm:leading-[0.78] md:text-8xl lg:text-[8.5rem] xl:text-[13rem]">
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

      <div data-wordmark-rail className="relative mt-5 h-px bg-ink/15 sm:mt-7">
        <span data-wordmark-marker className="absolute -top-[3px] left-0 h-[7px] w-2 bg-coral" />
      </div>
    </div>
  );
}
