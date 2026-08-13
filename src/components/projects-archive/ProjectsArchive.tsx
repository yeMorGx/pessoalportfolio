"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StackLogo } from "@/components/ui/StackLogo";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

type ProjectsArchiveProps = {
  projects: Project[];
};

const verticalOffsets = ["lg:-translate-y-14", "lg:translate-y-16", "lg:translate-y-1"];

export function ProjectsArchive({ projects }: ProjectsArchiveProps) {
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);
  const stageRef = useRef<HTMLElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLSpanElement | null>(null);
  const scrollTweenRef = useRef<{ kill: () => void } | null>(null);
  const scrollRangeRef = useRef({ start: 0, end: 0 });
  const activeIndexRef = useRef(-1);
  const navigatingRef = useRef(false);
  const motionEnabledRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const scrollToProject = useCallback(
    (index: number) => {
      const nextIndex = Math.max(0, Math.min(orderedProjects.length - 1, index));
      const { start, end } = scrollRangeRef.current;

      if (!motionEnabledRef.current || end <= start) {
        document.querySelector(`[data-archive-project="${nextIndex}"]`)?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        return;
      }

      const rail = railRef.current;
      const item = rail?.querySelector<HTMLElement>(`[data-archive-project="${nextIndex}"]`);

      if (!rail || !item) {
        return;
      }

      const distance = Math.max(1, rail.scrollWidth - window.innerWidth);
      const itemRect = item.getBoundingClientRect();
      const visualDelta = itemRect.left + itemRect.width / 2 - window.innerWidth / 2;
      const targetScroll = Math.max(start, Math.min(end, window.scrollY + visualDelta * ((end - start) / distance)));
      const position = { value: window.scrollY };
      const { gsap } = getGsap();

      scrollTweenRef.current?.kill();
      navigatingRef.current = true;
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      scrollTweenRef.current = gsap.to(position, {
        value: targetScroll,
        duration: 0.9,
        ease: "power2.inOut",
        onUpdate: () => window.scrollTo(0, position.value),
        onComplete: () => {
          scrollTweenRef.current = null;
          navigatingRef.current = false;
        }
      });
    },
    [orderedProjects.length]
  );

  useEffect(() => {
    const stage = stageRef.current;
    const rail = railRef.current;
    const progress = progressRef.current;

    if (!stage || !rail || !progress || prefersReducedMotion() || !window.matchMedia("(min-width: 1024px)").matches) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      const distance = () => Math.max(0, rail.scrollWidth - window.innerWidth);
      const tween = gsap.to(rail, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: () => `+=${Math.max(distance(), window.innerHeight * 1.5)}`,
          pin: true,
          scrub: 0.75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            scrollRangeRef.current = { start: self.start, end: self.end };
            motionEnabledRef.current = true;
          },
          onUpdate: (self) => {
            progress.style.transform = `scaleX(${self.progress})`;
            const viewportCenter = self.progress * distance() + window.innerWidth / 2;
            const centers = [window.innerWidth / 2, ...Array.from(rail.querySelectorAll<HTMLElement>("[data-archive-project]")).map((item) => item.offsetLeft + item.offsetWidth / 2)];
            const nearestCenter = centers.reduce((nearest, center, index) => Math.abs(center - viewportCenter) < Math.abs(centers[nearest] - viewportCenter) ? index : nearest, 0);
            const nextIndex = nearestCenter - 1;

            if (!navigatingRef.current && nextIndex !== activeIndexRef.current) {
              activeIndexRef.current = nextIndex;
              setActiveIndex(nextIndex);
            }
          }
        }
      });

      return () => tween.scrollTrigger?.kill();
    }, stage);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollToProject(activeIndexRef.current + 1);
      }

      if (event.key === "ArrowLeft" && activeIndexRef.current >= 0) {
        event.preventDefault();
        scrollToProject(activeIndexRef.current - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      scrollTweenRef.current?.kill();
      navigatingRef.current = false;
      motionEnabledRef.current = false;
      context.revert();
    };
  }, [orderedProjects.length, scrollToProject]);

  return (
    <main className="min-h-screen bg-ink text-ceramic">
      <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between border border-white/10 bg-ink/[0.9] px-3 shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-4">
          <Link href="/" className="flex h-full items-center gap-3 text-sm font-semibold focus:outline-none focus-visible:text-mint">
            <span className="flex h-8 w-8 items-center justify-center border border-white/10 bg-white/[0.04]">
              <Image src="/logo.svg" alt="" width={20} height={20} className="h-5 w-5" priority />
            </span>
            <span className="hidden sm:inline">Gabriel Morgado</span>
          </Link>

          <Link href="/" className="inline-flex h-9 items-center gap-2 border border-white/15 px-3 text-xs text-smoke transition-colors hover:border-mint/60 hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
            <ArrowLeft size={14} />
            Voltar ao início
          </Link>
        </div>
      </header>

      <section ref={stageRef} className="projects-archive-stage relative min-h-screen overflow-hidden border-b border-white/10 bg-ink">
        <div className="technical-grid pointer-events-none absolute inset-0 opacity-55" />
        <div ref={railRef} className="projects-archive-rail relative flex flex-col gap-16 px-5 pb-20 pt-28 sm:px-8 lg:h-screen lg:w-max lg:flex-row lg:items-center lg:gap-[11vw] lg:px-[7vw] lg:pb-0 lg:pt-0">
          <div className="w-full max-w-2xl shrink-0 lg:w-[28rem]">
            <div className="flex items-center justify-between border-b border-white/12 pb-4 font-mono text-[0.62rem] uppercase text-steel">
              <span>Arquivo de projetos</span>
              <span>{String(orderedProjects.length).padStart(2, "0")}</span>
            </div>
            <p className="mt-8 font-mono text-[0.62rem] uppercase text-mint">Produto / Engenharia / Segurança</p>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[0.92] text-ceramic sm:text-6xl lg:text-7xl">Projetos em movimento.</h1>
            <p className="mt-6 max-w-md text-base leading-7 text-steel">Uma visão contínua dos produtos, sistemas e experiências construídos entre estratégia e implementação.</p>
            <div className="mt-10 flex items-center gap-4 border-t border-white/12 pt-4 font-mono text-[0.58rem] uppercase text-slate-500">
              <span className="h-1.5 w-1.5 bg-coral" />
              Acervo em evolução
            </div>
          </div>

          {orderedProjects.map((project, index) => {
            const visibleTech = project.tech_stack.slice(0, 4);

            return (
              <article key={project.id} data-archive-project={index} className={`projects-archive-item w-full scroll-mt-24 lg:w-[min(68vw,62rem)] lg:shrink-0 ${verticalOffsets[index % verticalOffsets.length]}`}>
                <Link href={`/projetos/${project.slug}`} className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
                  <div className="grid gap-5 border-y border-white/12 py-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.65fr)] lg:items-center lg:gap-8">
                    <div className={`relative aspect-[16/10] overflow-hidden border border-white/12 bg-graphite shadow-2xl shadow-black/30 ${project.cover_display === "fullscreen" ? "" : "p-4 sm:p-6"}`}>
                      <div className={`relative h-full w-full overflow-hidden ${project.cover_display === "fullscreen" ? "" : "border border-white/10 bg-black/20"}`}>
                        <Image src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill priority={index === 0} sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
                      </div>
                      <span className="absolute left-3 top-3 bg-ink px-2 py-1 font-mono text-[0.58rem] text-steel">{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="pb-2 lg:py-4">
                      <div className="flex items-center justify-between gap-4 border-b border-white/12 pb-3 font-mono text-[0.58rem] uppercase text-steel">
                        <span>{project.product_role ?? "Produto digital"}</span>
                        <span className={project.featured ? "text-mint" : ""}>{project.featured ? "Destaque" : "Case"}</span>
                      </div>
                      <h2 className="mt-5 font-display text-3xl font-semibold leading-tight text-ceramic sm:text-4xl">{project.title}</h2>
                      <p className="mt-4 text-sm leading-6 text-smoke/75">{project.description}</p>
                      <div className="mt-6 flex flex-wrap gap-x-4 gap-y-3">
                        {visibleTech.map((tech) => (
                          <span key={tech} className="inline-flex items-center gap-2 text-xs text-smoke/75">
                            <StackLogo label={tech} className="h-4 w-4" />
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span className="mt-7 inline-flex items-center gap-2 border-b border-mint/50 pb-1 text-sm font-semibold text-mint">
                        Abrir case
                        <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}

          <div className="w-full max-w-xl shrink-0 border-y border-white/12 py-8 lg:w-[26rem]">
            <p className="font-mono text-[0.6rem] uppercase text-coral">Próxima conversa</p>
            <h2 className="mt-5 font-display text-4xl font-semibold leading-tight">Um produto forte começa com uma conversa clara.</h2>
            <p className="mt-5 text-sm leading-6 text-steel">Disponível para projetos digitais, sistemas internos e experiências de produto com direção técnica.</p>
            <a href="mailto:gabrielmcgoes@gmail.com" className="mt-8 inline-flex h-12 items-center gap-3 bg-ceramic px-5 text-sm font-semibold text-ink transition-colors hover:bg-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-ink">
              <Mail size={16} />
              Iniciar conversa
            </a>
          </div>
        </div>
      </section>

      <div className="projects-archive-controls pointer-events-none fixed bottom-5 left-1/2 z-40 hidden w-[min(92vw,56rem)] -translate-x-1/2 items-center gap-4 lg:flex">
        <div className="h-px flex-1 overflow-hidden bg-white/15">
          <span ref={progressRef} className="block h-full origin-left scale-x-0 bg-mint" />
        </div>
        <span className="min-w-14 text-center font-mono text-[0.62rem] text-steel">{String(Math.max(0, activeIndex + 1)).padStart(2, "0")} / {String(orderedProjects.length).padStart(2, "0")}</span>
        <div className="pointer-events-auto flex border border-white/15 bg-ink/90 backdrop-blur-xl">
          <button type="button" onClick={() => scrollToProject(activeIndex - 1)} disabled={activeIndex <= 0} aria-label="Projeto anterior" title="Projeto anterior" className="inline-flex h-10 w-10 items-center justify-center border-r border-white/15 text-ceramic transition-colors hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:cursor-not-allowed disabled:text-slate-700">
            <ChevronLeft size={17} />
          </button>
          <button type="button" onClick={() => scrollToProject(activeIndex + 1)} disabled={activeIndex >= orderedProjects.length - 1} aria-label="Próximo projeto" title="Próximo projeto" className="inline-flex h-10 w-10 items-center justify-center text-ceramic transition-colors hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:cursor-not-allowed disabled:text-slate-700">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </main>
  );
}
