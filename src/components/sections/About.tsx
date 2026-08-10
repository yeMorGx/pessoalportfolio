"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const highlights = ["Interfaces responsivas", "APIs e bancos relacionais", "Autenticação e áreas admin", "Microinterações com GSAP"];

export function About() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section id="sobre" ref={ref} className="border-y border-white/10 bg-white/[0.03] px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div data-reveal>
          <p className="font-mono text-sm uppercase text-mint">Sobre</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">Produto, código e acabamento visual no mesmo fluxo.</h2>
        </div>
        <div data-reveal className="space-y-6 text-lg leading-8 text-slate-300">
          <p>
            Trabalho com aplicações web de ponta a ponta: da arquitetura e modelagem dos dados até a camada visual que faz o produto parecer sólido desde o primeiro clique.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {highlights.map((item) => (
              <div key={item} className="border-l border-mint/50 bg-white/[0.04] px-4 py-3 text-base text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
