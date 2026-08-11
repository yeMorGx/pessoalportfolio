"use client";

import { ProjectCard } from "@/components/project-card/ProjectCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { Project } from "@/lib/projects";

export function Projects({ projects }: { projects: Project[] }) {
  const ref = useScrollReveal<HTMLElement>();
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projetos" ref={ref} className="px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[1fr_22rem] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase text-mint">Projetos selecionados</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Produtos pensados do fluxo à entrega.</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">Aplicações que conectam interface, regras de negócio, dados e operação em experiências completas.</p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {orderedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} variant={index === 0 ? "lead" : "default"} />
          ))}
        </div>
      </div>
    </section>
  );
}
