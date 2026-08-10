"use client";

import { Code2, Database, Gauge, ShieldCheck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const stack = [
  { icon: Code2, title: "Frontend", text: "Next.js, React, TypeScript, Tailwind CSS" },
  { icon: Database, title: "Dados", text: "Supabase, Postgres, Storage, políticas de acesso" },
  { icon: ShieldCheck, title: "Produto privado", text: "Auth, middleware, rotas protegidas e painel admin" },
  { icon: Gauge, title: "Experiência", text: "GSAP, ScrollTrigger, performance e acessibilidade" }
];

export function Experience() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section id="stack" ref={ref} className="border-y border-white/10 bg-white/[0.03] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal>
          <p className="font-mono text-sm uppercase text-mint">Stack</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">Base técnica para criar, medir e administrar.</h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {stack.map((item) => (
            <div key={item.title} data-reveal className="flex gap-5 border border-white/10 bg-ink/60 p-6">
              <item.icon className="mt-1 shrink-0 text-coral" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
