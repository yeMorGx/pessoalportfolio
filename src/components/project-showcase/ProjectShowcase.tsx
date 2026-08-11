"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink, Github } from "lucide-react";
import { useEffect, useRef } from "react";
import { StackLogo } from "@/components/ui/StackLogo";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import type { Project } from "@/lib/projects";

function isEmbeddableVideo(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
}

function getEmbedUrl(url: string) {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : url;
    }

    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
      return id ? `https://player.vimeo.com/video/${id}` : url;
    }
  } catch {
    return url;
  }

  return url;
}

function getGalleryItemClass(size: string | undefined) {
  if (size === "large") {
    return "md:col-span-2";
  }

  if (size === "full") {
    return "md:col-span-2 lg:col-span-3";
  }

  return "md:col-span-1";
}

function getGalleryAspectClass(size: string | undefined) {
  if (size === "full") {
    return "aspect-[4/3] sm:aspect-[21/9]";
  }

  if (size === "large") {
    return "aspect-[4/3] sm:aspect-[16/8]";
  }

  if (size === "small") {
    return "aspect-square";
  }

  return "aspect-[16/10]";
}

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[0.65rem] uppercase text-mint">
      <span className="text-steel">{number}</span>
      <span className="h-px w-8 bg-white/15" />
      {children}
    </div>
  );
}

export function ProjectShowcase({ project }: { project: Project }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const gallery = project.gallery_image_urls.length ? project.gallery_image_urls : [project.cover_image_url];
  const overview = project.product_overview ?? project.description;
  const features = project.product_features.length ? project.product_features : ["Experiência responsiva", "Fluxo principal implementado", "Base pronta para evolução"];
  const results = project.product_results.length ? project.product_results : ["Produto apresentável", "Arquitetura limpa", "Experiência consistente"];

  useEffect(() => {
    const root = rootRef.current;

    if (!root || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.fromTo("[data-project-intro]", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" });

      root.querySelectorAll<HTMLElement>("[data-project-section]").forEach((section) => {
        const items = section.querySelectorAll("[data-project-reveal]");

        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 88%",
              once: true
            }
          }
        );
      });

      gsap.fromTo(
        "[data-project-cover]",
        { yPercent: -2, scale: 1.03 },
        {
          yPercent: 5,
          scale: 1.06,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-project-cover-wrap]",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        }
      );
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="min-h-screen bg-ink text-white">
      <section className="relative overflow-hidden border-b border-white/10 px-5 pb-12 pt-6 sm:pb-16 sm:pt-8">
        <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div data-project-intro className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <Link href="/#projetos" className="group inline-flex items-center gap-2 text-xs text-slate-400 transition-colors hover:text-white focus:outline-none focus-visible:text-mint">
              <ArrowLeft className="transition-transform group-hover:-translate-x-0.5" size={15} />
              Voltar aos projetos
            </Link>
            <span className="font-mono text-[0.62rem] uppercase text-steel">Case / {project.slug}</span>
          </div>

          <div className="mt-10 grid gap-9 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div className="relative z-10">
              <p data-project-intro className="font-mono text-[0.68rem] uppercase text-mint">{project.product_role ?? "Produto digital"}</p>
              <h1 data-project-intro className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white sm:text-5xl">{project.title}</h1>
              <p data-project-intro className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">{project.description}</p>

              <div data-project-intro className="mt-7 flex flex-wrap gap-3">
                {project.project_url ? (
                  <a href={project.project_url} target="_blank" rel="noreferrer" className="group inline-flex h-11 items-center gap-2 rounded-sm bg-mint px-4 text-sm font-semibold text-ink transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
                    Abrir produto
                    <ExternalLink className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={15} />
                  </a>
                ) : null}
                {project.repo_url ? (
                  <a href={project.repo_url} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-sm border border-white/15 px-4 text-sm text-white transition-colors hover:border-mint/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
                    <Github size={15} />
                    Repositório
                  </a>
                ) : null}
              </div>
            </div>

            <div data-project-intro data-project-cover-wrap className="relative aspect-[16/10] overflow-hidden rounded-sm border border-white/12 bg-graphite shadow-2xl shadow-black/30">
              <Image data-project-cover src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover will-change-transform" />
            </div>
          </div>

          <div data-project-intro className="mt-9 grid grid-cols-2 border-y border-white/10 sm:grid-cols-3">
            <div className="border-r border-white/10 py-4 pr-4">
              <p className="font-mono text-[0.6rem] uppercase text-steel">Papel</p>
              <p className="mt-1 text-xs text-slate-200">{project.product_role ?? "Produto digital"}</p>
            </div>
            <div className="py-4 pl-4 sm:border-r sm:border-white/10 sm:px-4">
              <p className="font-mono text-[0.6rem] uppercase text-steel">Tecnologias</p>
              <p className="mt-1 text-xs text-slate-200">{project.tech_stack.length} na solução</p>
            </div>
            <div className="col-span-2 border-t border-white/10 py-4 sm:col-span-1 sm:border-t-0 sm:pl-4">
              <p className="font-mono text-[0.6rem] uppercase text-steel">Estado</p>
              <p className="mt-1 flex items-center gap-2 text-xs text-slate-200"><span className="h-1.5 w-1.5 bg-mint" /> Case publicado</p>
            </div>
          </div>
        </div>
      </section>

      <section data-project-section className="border-b border-white/10 px-5 py-10 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.25fr_0.75fr]">
          <div data-project-reveal>
            <SectionLabel number="01">Visão do produto</SectionLabel>
            <h2 className="mt-5 max-w-2xl text-2xl font-semibold leading-snug text-white sm:text-3xl">O que o produto resolve.</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{overview}</p>
          </div>
          <div data-project-reveal className="border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="font-mono text-[0.65rem] uppercase text-steel">Stack do projeto</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="inline-flex h-8 items-center gap-2 border border-white/12 px-3 text-xs text-slate-200">
                  <StackLogo label={tech} className="h-4 w-4" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {project.video_url ? (
        <section data-project-section className="border-b border-white/10 px-5 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div data-project-reveal>
              <SectionLabel number="02">Demonstração</SectionLabel>
              <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Produto em movimento.</h2>
            </div>
            <div data-project-reveal className="mt-7 aspect-video overflow-hidden rounded-sm border border-white/12 bg-black">
              {isEmbeddableVideo(project.video_url) ? (
                <iframe className="h-full w-full" src={getEmbedUrl(project.video_url)} title={`Demo ${project.title}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              ) : (
                <video className="h-full w-full" src={project.video_url} controls preload="metadata" />
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section data-project-section className="border-b border-white/10 px-5 py-14 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div data-project-reveal>
            <SectionLabel number={project.video_url ? "03" : "02"}>Galeria</SectionLabel>
            <h2 className="mt-5 text-2xl font-semibold text-white sm:text-3xl">Telas e detalhes do produto.</h2>
          </div>
          <div className="mt-7 grid auto-rows-auto gap-4 md:grid-cols-2 lg:grid-cols-3">
            {gallery.map((imageUrl, index) => (
              <figure key={`${imageUrl}-${index}`} data-project-reveal className={`overflow-hidden rounded-sm border border-white/12 bg-graphite ${getGalleryItemClass(project.gallery_image_sizes[index])}`}>
                <img src={imageUrl} alt={`${project.title}, tela ${index + 1}`} loading="lazy" className={`${getGalleryAspectClass(project.gallery_image_sizes[index])} w-full object-cover`} />
                <figcaption className="flex items-center justify-between border-t border-white/10 px-4 py-3 font-mono text-[0.6rem] uppercase text-steel">
                  <span>Tela {String(index + 1).padStart(2, "0")}</span>
                  <span>{project.gallery_image_sizes[index] ?? "medium"}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section data-project-section className="px-5 py-14 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-8">
          <div data-project-reveal>
            <SectionLabel number={project.video_url ? "04" : "03"}>Features</SectionLabel>
            <h2 className="mt-5 text-2xl font-semibold text-white">O que foi construído.</h2>
            <ol className="mt-6 border-t border-white/10">
              {features.map((feature, index) => (
                <li key={feature} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-white/10 py-4 text-sm leading-6 text-slate-200">
                  <span className="font-mono text-[0.62rem] text-mint">{String(index + 1).padStart(2, "0")}</span>
                  {feature}
                </li>
              ))}
            </ol>
          </div>
          <div data-project-reveal>
            <SectionLabel number={project.video_url ? "05" : "04"}>Impacto</SectionLabel>
            <h2 className="mt-5 text-2xl font-semibold text-white">O valor entregue.</h2>
            <ol className="mt-6 border-t border-white/10">
              {results.map((result, index) => (
                <li key={result} className="grid grid-cols-[2rem_1fr] gap-3 border-b border-white/10 py-4 text-sm leading-6 text-slate-200">
                  <span className="font-mono text-[0.62rem] text-coral">{String(index + 1).padStart(2, "0")}</span>
                  {result}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer data-project-section className="border-t border-white/10 px-5 py-10">
        <div data-project-reveal className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-[0.62rem] uppercase text-steel">Próximo passo</p>
            <p className="mt-2 text-base font-medium text-white">Explore os outros produtos.</p>
          </div>
          <Link href="/#projetos" className="group inline-flex h-11 items-center gap-2 self-start rounded-sm border border-white/15 px-4 text-sm text-white transition-colors hover:border-mint/60 sm:self-auto">
            Ver todos os projetos
            <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={15} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
