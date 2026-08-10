"use client";

import Image from "next/image";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const orbitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;

    if (!hero || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo("[data-hero]", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" });
      gsap.to(orbitRef.current, {
        yPercent: 18,
        rotate: 8,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, hero);

    return () => context.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-[92vh] items-center px-5 pt-28">
      <div ref={orbitRef} className="absolute right-[-12rem] top-24 h-[34rem] w-[34rem] rounded-full border border-mint/20 bg-mint/5 blur-sm" aria-hidden="true" />
      <div className="mx-auto grid w-full max-w-6xl gap-12 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p data-hero className="mb-5 inline-flex items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm text-mint">
            Full-stack developer criando produtos rápidos, vivos e bem acabados.
          </p>
          <h1 data-hero className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal text-white sm:text-7xl lg:text-8xl">
            Gabriel Morgado
          </h1>
          <p data-hero className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Desenvolvimento interfaces precisas, sistemas confiáveis e experiências digitais com movimento suficiente para guiar o olhar sem atrapalhar o uso.
          </p>
          <div data-hero className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#projetos" className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white">
              Ver projetos
              <ArrowDown size={16} />
            </a>
            <a href="mailto:contato@example.com" className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm text-white transition hover:border-coral/70">
              <Mail size={16} />
              Contato
            </a>
          </div>
          <div data-hero className="mt-8 flex items-center gap-4 text-slate-400">
            <a href="https://github.com/" aria-label="GitHub" className="transition hover:text-white">
              <Github size={21} />
            </a>
            <a href="https://linkedin.com/" aria-label="LinkedIn" className="transition hover:text-white">
              <Linkedin size={21} />
            </a>
          </div>
        </div>
        <div data-hero className="relative mx-auto aspect-square w-full max-w-[25rem]">
          <div className="absolute inset-0 rounded-[2rem] border border-white/12 bg-white/6 shadow-glow backdrop-blur" />
          <div className="absolute inset-8 rounded-[1.5rem] border border-white/10 bg-graphite" />
          <Image className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2" src="/logo.svg" alt="Logo Gabriel Morgado" width={176} height={176} priority />
          <div className="absolute bottom-8 left-8 right-8 rounded-xl border border-white/10 bg-ink/70 p-4">
            <p className="font-mono text-xs uppercase text-steel">Current focus</p>
            <p className="mt-2 text-sm text-slate-200">Next.js, Supabase, design systems e animações com intenção.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
