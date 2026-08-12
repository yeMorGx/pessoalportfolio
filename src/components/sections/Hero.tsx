"use client";

import dynamic from "next/dynamic";
import { Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const LogoScene = dynamic(() => import("@/components/three/LogoScene").then((module) => module.LogoScene), { ssr: false });

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const scrollProgress = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    const scene = sceneRef.current;
    const reduced = prefersReducedMotion();
    setReducedMotion(reduced);

    if (!hero || !scene || reduced) {
      return undefined;
    }

    const { gsap } = getGsap();
    const progress = { value: 0 };
    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .fromTo(scene, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 1.35, ease: "power2.out" })
        .fromTo("[data-hero-line]", { autoAlpha: 0, yPercent: 110 }, { autoAlpha: 1, yPercent: 0, duration: 0.8, stagger: 0.09 }, "-=0.9")
        .fromTo("[data-hero-meta]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.08 }, "-=0.45");

      gsap.to(progress, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        },
        onUpdate: () => {
          scrollProgress.current = progress.value;
        }
      });

      gsap.to("[data-hero-copy]", {
        yPercent: -15,
        autoAlpha: 0.18,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "38% top",
          end: "bottom top",
          scrub: true
        }
      });
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-[92svh] overflow-hidden border-b border-white/10 bg-ink px-5 pb-8 pt-24 sm:min-h-[94svh] sm:pb-12 sm:pt-28">
      <div ref={sceneRef} className="absolute inset-0" aria-hidden="true">
        <div className="technical-grid absolute right-0 top-0 h-[72%] w-full opacity-65 lg:h-full lg:w-[68%]" />
        <div className="absolute inset-0">
          {reducedMotion ? (
            <div className="flex h-full items-start justify-center pt-32 sm:pt-36 lg:items-center lg:justify-end lg:pr-[16%] lg:pt-0">
              <img src="/logo.svg" alt="" className="h-40 w-40 opacity-90 sm:h-56 sm:w-56" />
            </div>
          ) : (
            <div className="h-full w-full lg:pl-[6%] xl:pl-[8%]">
              <LogoScene scrollProgress={scrollProgress} />
            </div>
          )}
        </div>
        <div className="scene-reticle absolute right-[8%] top-[12%] hidden h-[70%] w-[52%] lg:block" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(92svh-8rem)] max-w-7xl flex-col justify-end sm:min-h-[calc(94svh-8.5rem)]">
        <div className="absolute left-0 top-0 hidden items-center gap-3 font-mono text-[0.62rem] uppercase text-steel sm:flex sm:text-[0.68rem]">
          <span className="h-1.5 w-1.5 bg-mint" />
          Interface / Sistemas / Segurança
        </div>

        <div data-hero-copy className="relative z-10 max-w-[50rem] pb-4 sm:pb-8">
          <h1 className="font-display text-5xl font-semibold leading-[0.94] text-ceramic sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden"><span data-hero-line className="block">Gabriel</span></span>
            <span className="block overflow-hidden"><span data-hero-line className="block text-steel">Morgado</span></span>
          </h1>

          <div className="mt-6 max-w-xl overflow-hidden">
            <p data-hero-line className="text-base leading-7 text-smoke sm:text-lg sm:leading-8">Desenvolvo produtos digitais entre interface, sistemas e segurança.</p>
          </div>

          <div data-hero-meta className="mt-7 grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 sm:flex sm:flex-wrap sm:items-center">
            <a href="#projetos" className="group inline-flex h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-ceramic px-3 text-xs font-semibold text-ink transition-colors hover:bg-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-ink sm:px-5 sm:text-sm">
              Ver projetos
              <PortfolioIcon name="down" className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" />
            </a>
            <a href="mailto:gabrielmcgoes@gmail.com" className="inline-flex h-12 min-w-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm border border-white/18 bg-ink/35 px-3 text-xs text-white backdrop-blur-sm transition-colors hover:border-coral/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:px-5 sm:text-sm">
              <Mail size={16} />
              <span className="min-[360px]:hidden">Contato</span>
              <span className="hidden min-[360px]:inline">Entrar em contato</span>
            </a>
          </div>
        </div>

        <div data-hero-meta className="relative z-10 flex items-end justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-4 text-steel">
            <a href="https://github.com/yeMorGx" target="_blank" rel="noreferrer" aria-label="GitHub" className="transition-colors hover:text-white focus:outline-none focus-visible:text-mint"><Github size={18} /></a>
            <a href="https://www.linkedin.com/in/gabrielmcgoes" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition-colors hover:text-white focus:outline-none focus-visible:text-mint"><Linkedin size={18} /></a>
          </div>
          <p className="font-mono text-[0.58rem] uppercase text-slate-500">Role para explorar</p>
        </div>
      </div>
    </section>
  );
}
