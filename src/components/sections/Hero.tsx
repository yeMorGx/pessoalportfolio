"use client";

import Image from "next/image";
import { ArrowDownRight, Github, Linkedin, Mail } from "lucide-react";
import { useEffect, useRef } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

const capabilities = [
  {
    label: "Front-end",
    detail: "Interfaces e movimento",
    className: "left-[4%] top-[17%] sm:left-[8%] sm:top-[16%]",
    accent: "bg-mint",
    depth: 18
  },
  {
    label: "Back-end",
    detail: "APIs, dados e automação",
    className: "right-[2%] top-[23%] sm:right-[5%] sm:top-[20%]",
    accent: "bg-coral",
    depth: 28
  },
  {
    label: "Cyber",
    detail: "Monitoramento e defesa",
    className: "bottom-[14%] left-[12%] sm:bottom-[12%] sm:left-[17%]",
    accent: "bg-steel",
    depth: 36
  }
];

export function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const field = fieldRef.current;

    if (!hero || !field || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    let removePointerListeners = () => undefined;

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro
        .fromTo("[data-hero-item]", { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.1 })
        .fromTo("[data-field-shell]", { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 1 }, "-=0.55")
        .fromTo(
          "[data-signal-line]",
          { autoAlpha: 0, strokeDashoffset: 1 },
          { autoAlpha: 0.62, strokeDashoffset: 0, duration: 1.05, stagger: 0.08 },
          "-=0.75"
        )
        .fromTo("[data-signal-node]", { autoAlpha: 0, scale: 0.82 }, { autoAlpha: 1, scale: 1, duration: 0.7, stagger: 0.09 }, "-=0.9");

      gsap.to(field, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      if (window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) {
        const nodes = Array.from(hero.querySelectorAll<HTMLElement>("[data-signal-node]"));
        const motion = nodes.map((node) => ({
          depth: Number(node.dataset.depth ?? 20),
          x: gsap.quickTo(node, "x", { duration: 0.65, ease: "power3.out" }),
          y: gsap.quickTo(node, "y", { duration: 0.65, ease: "power3.out" })
        }));

        const handlePointerMove = (event: PointerEvent) => {
          const x = event.clientX / window.innerWidth - 0.5;
          const y = event.clientY / window.innerHeight - 0.5;

          motion.forEach((item) => {
            item.x(x * item.depth);
            item.y(y * item.depth);
          });
        };

        const handlePointerLeave = () => {
          motion.forEach((item) => {
            item.x(0);
            item.y(0);
          });
        };

        hero.addEventListener("pointermove", handlePointerMove);
        hero.addEventListener("pointerleave", handlePointerLeave);
        removePointerListeners = () => {
          hero.removeEventListener("pointermove", handlePointerMove);
          hero.removeEventListener("pointerleave", handlePointerLeave);
          gsap.killTweensOf(nodes);
        };
      }
    }, hero);

    return () => {
      removePointerListeners();
      context.revert();
    };
  }, []);

  return (
    <section ref={heroRef} className="relative flex min-h-[94svh] overflow-hidden border-b border-white/10 px-5 pb-8 pt-24 sm:pb-16 sm:pt-28">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div className="absolute left-5 right-5 top-20 h-px bg-white/10 sm:top-24" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 sm:gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-6">
        <div className="relative z-10 max-w-2xl pb-2 lg:pb-12">
          <p data-hero-item className="mb-6 flex items-center gap-3 font-mono text-[0.68rem] uppercase text-slate-300 sm:text-xs">
            <span className="h-2 w-2 bg-mint shadow-[0_0_18px_rgba(119,242,195,0.75)]" />
            Full-stack + Cibersegurança
          </p>

          <h1 data-hero-item className="text-5xl font-semibold leading-[0.96] text-white sm:text-6xl lg:text-7xl">
            Gabriel
            <span className="block text-slate-400">Morgado</span>
          </h1>

          <p data-hero-item className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Transformo interfaces, dados e segurança em produtos digitais claros, confiáveis e prontos para o mundo real.
          </p>

          <div data-hero-item className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#projetos" className="group inline-flex h-12 items-center gap-2 rounded-sm bg-mint px-5 text-sm font-semibold text-ink transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
              Explorar projetos
              <ArrowDownRight className="transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" size={16} />
            </a>
            <a href="mailto:contato@example.com" className="inline-flex h-12 items-center gap-2 rounded-sm border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:border-coral/70 hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-coral">
              <Mail size={16} />
              Falar comigo
            </a>
          </div>

          <div data-hero-item className="mt-8 flex items-center gap-5 border-l border-white/15 pl-4 text-slate-400">
            <span className="font-mono text-[0.65rem] uppercase text-steel">Conecte</span>
            <a href="https://github.com/" aria-label="GitHub" className="transition-colors hover:text-white focus:outline-none focus-visible:text-mint">
              <Github size={19} />
            </a>
            <a href="https://linkedin.com/" aria-label="LinkedIn" className="transition-colors hover:text-white focus:outline-none focus-visible:text-mint">
              <Linkedin size={19} />
            </a>
          </div>
        </div>

        <div ref={fieldRef} data-field-shell className="relative h-[16rem] w-full sm:h-[27rem] lg:h-[36rem]" aria-hidden="true">
          <div className="absolute inset-x-[6%] top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-[4%] left-1/2 top-[4%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 720 620" fill="none" preserveAspectRatio="none">
            <path data-signal-line pathLength="1" strokeDasharray="1" d="M351 306 122 124" stroke="rgba(119,242,195,.72)" strokeWidth="1.5" />
            <path data-signal-line pathLength="1" strokeDasharray="1" d="M359 306 605 160" stroke="rgba(255,107,95,.7)" strokeWidth="1.5" />
            <path data-signal-line pathLength="1" strokeDasharray="1" d="M351 316 184 500" stroke="rgba(141,162,184,.72)" strokeWidth="1.5" />
            <path data-signal-line pathLength="1" strokeDasharray="1" d="M360 310 545 455" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
            <path data-signal-line pathLength="1" strokeDasharray="1 0.03" d="M122 124 605 160" stroke="rgba(255,255,255,.13)" strokeWidth="1" />
            <path data-signal-line pathLength="1" strokeDasharray="1 0.03" d="M184 500 545 455" stroke="rgba(255,255,255,.13)" strokeWidth="1" />
          </svg>

          {capabilities.map((capability) => (
            <div key={capability.label} data-signal-node data-depth={capability.depth} className={`absolute ${capability.className}`}>
              <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase text-white sm:text-[0.7rem]">
                <span className={`h-2 w-2 ${capability.accent}`} />
                {capability.label}
              </div>
              <p className="mt-1 max-w-[9rem] text-[0.66rem] leading-5 text-slate-400 sm:text-xs">{capability.detail}</p>
            </div>
          ))}

          <div data-signal-node data-depth="12" className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-mint/35 bg-ink/85 shadow-[0_0_60px_rgba(119,242,195,0.14)] sm:h-36 sm:w-36">
            <span className="absolute -inset-3 border border-white/10" />
            <Image src="/logo.svg" alt="" width={80} height={80} className="h-16 w-16 sm:h-20 sm:w-20" priority />
          </div>

          <div data-signal-node data-depth="22" className="absolute bottom-[16%] right-[2%] hidden items-center gap-3 border-t border-white/15 pt-3 sm:flex">
            <span className="font-mono text-[0.62rem] uppercase text-steel">Sistema</span>
            <span className="flex items-center gap-2 font-mono text-[0.62rem] uppercase text-white">
              <span className="h-1.5 w-1.5 bg-mint" />
              Operacional
            </span>
          </div>
        </div>

        <div data-hero-item className="absolute bottom-0 left-0 hidden items-center gap-4 font-mono text-[0.62rem] uppercase text-slate-500 lg:flex">
          <span>Role para explorar</span>
          <span className="h-px w-20 bg-white/20" />
          <span>01 / 05</span>
        </div>
      </div>
    </section>
  );
}
