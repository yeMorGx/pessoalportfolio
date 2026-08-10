"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Contact() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section id="contato" ref={ref} className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="max-w-3xl">
          <p className="font-mono text-sm uppercase text-mint">Contato</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Vamos construir algo que pareça tão bom quanto funciona.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">Aberto para projetos full-stack, dashboards, áreas administrativas e interfaces com um pouco mais de presença.</p>
        </div>
        <div data-reveal className="mt-10 flex flex-wrap gap-3">
          <a href="mailto:contato@example.com" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:bg-mint">
            <Mail size={16} />
            Email
          </a>
          <a href="https://github.com/" className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm text-white transition hover:border-mint/70">
            <Github size={16} />
            GitHub
          </a>
          <a href="https://linkedin.com/" className="inline-flex items-center gap-2 rounded-full border border-white/14 px-5 py-3 text-sm text-white transition hover:border-mint/70">
            <Linkedin size={16} />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
