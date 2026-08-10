"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";
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
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
            {project.featured ? <span className="rounded-full bg-mint/12 px-3 py-1 text-xs font-medium text-mint">Destaque</span> : null}
          </div>
          <p className="mt-3 min-h-24 text-sm leading-6 text-slate-300">{project.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {project.tech_stack.map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                {tech}
              </span>
            ))}
          </div>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-mint">
            Ver produto
            <ArrowUpRight size={16} />
          </span>
        </div>
      </article>
    </Link>
  );
}
