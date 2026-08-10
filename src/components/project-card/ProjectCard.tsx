"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
import { StackLogo } from "@/components/ui/StackLogo";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const isFullscreenCover = project.cover_display === "fullscreen";
  useTilt(cardRef);

  return (
    <Link href={`/projetos/${project.slug}`} className="block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
      <article ref={cardRef} data-reveal className="group relative h-full overflow-hidden rounded-lg border border-white/12 bg-white/[0.04] shadow-2xl shadow-black/20 will-change-transform">
        <div className={`relative aspect-[16/10] overflow-hidden bg-graphite ${isFullscreenCover ? "" : "p-7"}`}>
          {isFullscreenCover ? (
            <Image src={project.cover_image_url} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="relative h-full w-full overflow-hidden rounded-md bg-white/[0.04] shadow-2xl shadow-black/30">
              <Image src={project.cover_image_url} alt="" fill sizes="(min-width: 1024px) 28vw, 82vw" className="object-cover transition duration-700 group-hover:scale-105" />
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-6 text-white">{project.title}</h3>
            {project.featured ? <span className="shrink-0 rounded-full bg-mint/12 px-2.5 py-1 text-[0.68rem] font-medium text-mint">Destaque</span> : null}
          </div>
          <p className="mt-2 line-clamp-3 min-h-[4.5rem] text-xs leading-6 text-slate-300">{project.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <span key={tech} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[0.68rem] text-slate-300">
                <StackLogo label={tech} className="h-3 w-3" />
                {tech}
              </span>
            ))}
          </div>
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-mint">
            Ver produto
            <ArrowUpRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}
