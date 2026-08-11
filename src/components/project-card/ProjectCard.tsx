"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { StackLogo } from "@/components/ui/StackLogo";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
  index: number;
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const isFullscreenCover = project.cover_display === "fullscreen";
  const reverse = index % 2 === 1;
  const visibleTech = project.tech_stack.slice(0, 6);
  const hiddenTechCount = project.tech_stack.length - visibleTech.length;
  useTilt(mediaRef);

  return (
    <Link href={`/projetos/${project.slug}`} className="group block border-b border-white/12 py-9 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint sm:py-12">
      <article data-reveal className="grid gap-7 lg:grid-cols-12 lg:items-center lg:gap-12">
        <div className={`${reverse ? "lg:order-2" : ""} lg:col-span-7`}>
          <div ref={mediaRef} className={`relative aspect-[16/10] overflow-hidden border border-white/12 bg-graphite shadow-2xl shadow-black/25 will-change-transform ${isFullscreenCover ? "" : "p-5 sm:p-8"}`}>
            {isFullscreenCover ? (
              <Image src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
            ) : (
              <div className="relative h-full w-full overflow-hidden border border-white/10 bg-black/20 shadow-xl shadow-black/25">
                <Image src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill sizes="(min-width: 1024px) 48vw, 90vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
              </div>
            )}
            <span className="absolute left-3 top-3 bg-ink px-2 py-1 font-mono text-[0.58rem] text-steel sm:left-4 sm:top-4">{String(index + 1).padStart(2, "0")}</span>
          </div>
        </div>

        <div className={`${reverse ? "lg:order-1" : ""} lg:col-span-5`}>
          <div className="flex items-center justify-between gap-4 border-b border-white/12 pb-3 font-mono text-[0.6rem] uppercase text-steel">
            <span>{project.product_role ?? "Produto digital"}</span>
            {project.featured ? <span className="text-mint">Destaque</span> : <span>Case</span>}
          </div>

          <h3 className="mt-5 font-display text-2xl font-semibold leading-tight text-ceramic sm:text-3xl">{project.title}</h3>
          <p className="mt-4 max-w-xl text-sm leading-6 text-smoke/80 sm:text-[0.95rem] sm:leading-7">{project.description}</p>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-3">
            {visibleTech.map((tech) => (
              <span key={tech} className="inline-flex items-center gap-2 text-xs text-smoke/80">
                <StackLogo label={tech} className="h-4 w-4" />
                {tech}
              </span>
            ))}
            {hiddenTechCount > 0 ? <span className="font-mono text-[0.62rem] text-steel">+{hiddenTechCount}</span> : null}
          </div>

          <span className="mt-7 inline-flex items-center gap-2 border-b border-mint/50 pb-1 text-sm font-semibold text-mint">
            Explorar produto
            <PortfolioIcon name="link" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}
