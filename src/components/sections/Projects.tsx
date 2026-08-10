"use client";

import { ProjectCard } from "@/components/project-card/ProjectCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Project } from "@/lib/projects";

export function Projects({ projects }: { projects: Project[] }) {
  const ref = useScrollReveal<HTMLElement>();
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projetos" ref={ref} className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-sm uppercase text-mint">Projetos</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">Sistemas com cara de produto pronto.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-400">Cards com tilt no desktop e fallback estável em toque, mantendo performance e leitura limpa.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {orderedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
