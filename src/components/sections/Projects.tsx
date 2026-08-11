"use client";

import { ProjectCard } from "@/components/project-card/ProjectCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Project } from "@/lib/projects";

export function Projects({ projects }: { projects: Project[] }) {
  const ref = useScrollReveal<HTMLElement>();
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projetos" ref={ref} className="bg-ink px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center justify-between border-b border-white/12 pb-4 font-mono text-[0.65rem] uppercase text-steel">
          <span>Projetos selecionados</span>
          <span>02</span>
        </div>

        <div data-reveal className="grid gap-5 border-b border-white/12 py-8 lg:grid-cols-[1fr_25rem] lg:items-end lg:py-10">
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.08] text-ceramic sm:text-4xl lg:text-5xl">Produtos construídos para funcionar e convencer.</h2>
          <p className="max-w-md text-sm leading-6 text-steel sm:text-base sm:leading-7">Cada case mostra o problema, as decisões de produto e a base técnica por trás da entrega.</p>
        </div>

        <div>
          {orderedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
