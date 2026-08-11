"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { StackLogo } from "@/components/ui/StackLogo";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/lib/projects";

type ProjectCardProps = {
  project: Project;
  index: number;
  variant?: "lead" | "default";
};

export function ProjectCard({ project, index, variant = "default" }: ProjectCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const isFullscreenCover = project.cover_display === "fullscreen";
  const isLead = variant === "lead";
  const visibleTech = project.tech_stack.slice(0, isLead ? 7 : 5);
  const hiddenTechCount = project.tech_stack.length - visibleTech.length;
  useTilt(cardRef);

  return (
    <Link href={`/projetos/${project.slug}`} className={`${isLead ? "md:col-span-2" : ""} group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mint`}>
      <article
        ref={cardRef}
        data-reveal
        className={`relative h-full overflow-hidden rounded-sm border border-white/12 bg-white/[0.035] shadow-2xl shadow-black/20 transition-colors hover:border-white/25 will-change-transform ${isLead ? "lg:grid lg:min-h-[27rem] lg:grid-cols-[1.25fr_0.75fr]" : ""}`}
      >
        <div className={`relative overflow-hidden bg-graphite ${isLead ? "aspect-[16/9] lg:aspect-auto lg:min-h-full" : "aspect-[16/10]"} ${isFullscreenCover ? "" : isLead ? "p-6 sm:p-10" : "p-6"}`}>
          {isFullscreenCover ? (
            <Image src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill sizes={isLead ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 768px) 50vw, 100vw"} className="object-cover transition duration-700 group-hover:scale-[1.035]" />
          ) : (
            <div className="relative h-full w-full overflow-hidden rounded-sm border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30">
              <Image src={project.cover_image_url} alt={`Capa do projeto ${project.title}`} fill sizes={isLead ? "(min-width: 1024px) 48vw, 86vw" : "(min-width: 768px) 42vw, 86vw"} className="object-cover transition duration-700 group-hover:scale-[1.035]" />
            </div>
          )}
          <span className="absolute left-4 top-4 border border-white/15 bg-ink/75 px-2 py-1 font-mono text-[0.62rem] text-slate-300 backdrop-blur sm:left-5 sm:top-5">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <div className={`flex flex-col p-5 sm:p-6 ${isLead ? "lg:justify-between lg:p-8" : ""}`}>
          <div className="flex items-start justify-between gap-3">
            <h3 className={`${isLead ? "text-xl" : "text-base"} font-semibold leading-6 text-white`}>{project.title}</h3>
            {project.featured ? <span className="shrink-0 border border-mint/25 bg-mint/10 px-2 py-1 font-mono text-[0.6rem] uppercase text-mint">Destaque</span> : null}
          </div>
          <p className={`mt-3 line-clamp-3 text-sm leading-6 text-slate-300 ${isLead ? "max-w-md" : "min-h-[4.5rem]"}`}>{project.description}</p>

          <div className={isLead ? "mt-8 lg:mt-auto lg:pt-10" : "mt-5"}>
            <div className="flex flex-wrap gap-1.5">
              {visibleTech.map((tech) => (
                <span key={tech} className="inline-flex h-7 items-center gap-1.5 border border-white/10 px-2.5 text-[0.66rem] text-slate-300">
                  <StackLogo label={tech} className="h-3 w-3" />
                  {tech}
                </span>
              ))}
              {hiddenTechCount > 0 ? <span className="inline-flex h-7 items-center border border-white/10 px-2.5 font-mono text-[0.62rem] text-steel">+{hiddenTechCount}</span> : null}
            </div>

            <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-mint">
              Ver produto
              <ArrowUpRight className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
