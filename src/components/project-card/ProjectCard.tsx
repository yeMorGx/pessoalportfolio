"use client";

import Image from "next/image";
import { ExternalLink, Github } from "lucide-react";
import { useRef } from "react";
import { useTilt } from "@/hooks/useTilt";
import type { Project } from "@/lib/projects";

export function ProjectCard({ project }: { project: Project }) {
  const cardRef = useRef<HTMLElement | null>(null);
  useTilt(cardRef);

  return (
    <article ref={cardRef} data-reveal className="group relative h-full overflow-hidden rounded-lg border border-white/12 bg-white/[0.04] shadow-2xl shadow-black/20 will-change-transform">
      <div className="relative aspect-[16/10] overflow-hidden bg-graphite">
        <Image src={project.cover_image_url} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
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
        <div className="mt-6 flex gap-3 text-slate-300">
          {project.project_url ? (
            <a href={project.project_url} className="inline-flex items-center gap-2 text-sm transition hover:text-mint">
              <ExternalLink size={16} />
              Live
            </a>
          ) : null}
          {project.repo_url ? (
            <a href={project.repo_url} className="inline-flex items-center gap-2 text-sm transition hover:text-mint">
              <Github size={16} />
              Repo
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
