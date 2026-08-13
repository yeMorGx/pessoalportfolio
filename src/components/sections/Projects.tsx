"use client";

import Link from "next/link";
import { ProjectCard } from "@/components/project-card/ProjectCard";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { projectsPath, siteCopy, type Locale } from "@/lib/i18n";
import type { Project } from "@/lib/projects";

export function Projects({ locale, projects }: { locale: Locale; projects: Project[] }) {
  const ref = useScrollReveal<HTMLElement>();
  const orderedProjects = [...projects].sort((a, b) => a.order - b.order).slice(0, 3);
  const copy = siteCopy[locale].projects;

  return (
    <section id="projetos" ref={ref} className="bg-ink px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center justify-between border-b border-white/12 pb-4 font-mono text-[0.65rem] uppercase text-steel">
          <span>{copy.sectionLabel}</span>
          <span>02</span>
        </div>

        <div data-reveal className="grid gap-5 border-b border-white/12 py-8 lg:grid-cols-[1fr_25rem] lg:items-end lg:py-10">
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.08] text-ceramic sm:text-4xl lg:text-5xl">{copy.heading}</h2>
          <p className="max-w-md text-sm leading-6 text-steel sm:text-base sm:leading-7">{copy.body}</p>
        </div>

        <div>
          {orderedProjects.map((project, index) => (
            <ProjectCard key={project.id} locale={locale} project={project} index={index} />
          ))}
        </div>

        <div data-reveal className="flex justify-end border-b border-white/12 py-8 sm:py-10">
          <Link href={projectsPath(locale)} className="group inline-flex h-12 items-center gap-3 border border-white/16 px-5 text-sm font-semibold text-ceramic transition-colors hover:border-mint/60 hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint">
            {copy.all}
            <PortfolioIcon name="right" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
