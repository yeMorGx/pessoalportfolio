"use client";

import { StackLogo } from "@/components/ui/StackLogo";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type StackGroup = {
  title: string;
  description: string;
  direction?: "normal" | "reverse";
  accent: string;
  items: string[];
};

const stackGroups: StackGroup[] = [
  {
    title: "Dev / Front",
    description: "Interfaces, componentes e experiências responsivas.",
    accent: "text-mint",
    items: ["JavaScript", "TypeScript", "Next.js", "React", "HTML5", "CSS"]
  },
  {
    title: "Dev / Back",
    description: "Serviços, autenticação, dados e integrações.",
    direction: "reverse",
    accent: "text-coral",
    items: ["Python", "MySQL", "PHP", "Composer", "Laravel", "Rust", "PostgreSQL", "Supabase", "API", "SSO"]
  },
  {
    title: "Ciber",
    description: "Monitoramento, resposta e segurança de aplicações.",
    accent: "text-steel",
    items: ["Wazuh", "TheHive", "OWASP Top 10", "RedTeam", "SOC"]
  }
];

function StackCarousel({ group, index }: { group: StackGroup; index: number }) {
  const repeatedItems = [
    ...group.items.map((label) => ({ label, clone: false })),
    ...group.items.map((label) => ({ label, clone: true }))
  ];

  return (
    <div data-reveal className="border-t border-white/10 py-6 last:border-b">
      <div className="mb-5 grid gap-2 md:grid-cols-[9rem_1fr_auto] md:items-center md:gap-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.6rem] text-slate-600">{String(index + 1).padStart(2, "0")}</span>
          <h3 className={`font-mono text-xs uppercase ${group.accent}`}>{group.title}</h3>
        </div>
        <p className="text-xs leading-5 text-slate-400 sm:text-sm">{group.description}</p>
        <span className="hidden font-mono text-[0.6rem] uppercase text-slate-600 md:block">{group.items.length} tecnologias</span>
      </div>

      <div className="stack-marquee border-y border-white/10 bg-white/[0.02]" data-direction={group.direction ?? "normal"} role="list" aria-label={group.title}>
        <div className="stack-marquee__track">
          {repeatedItems.map((item, itemIndex) => (
            <div
              key={`${item.label}-${itemIndex}`}
              className="stack-pill"
              role={item.clone ? undefined : "listitem"}
              aria-hidden={item.clone ? true : undefined}
              data-clone={item.clone ? "true" : undefined}
            >
              <StackLogo label={item.label} className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Experience() {
  const ref = useScrollReveal<HTMLElement>();

  return (
    <section id="stack" ref={ref} className="border-y border-white/10 bg-white/[0.025] px-5 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal className="grid gap-6 border-b border-white/10 pb-8 md:grid-cols-[1fr_22rem] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase text-mint">Stack</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Tecnologias entre produto, dados e defesa.</h2>
          </div>
          <p className="text-sm leading-6 text-slate-400">Uma base multidisciplinar para construir a experiência, sustentar a operação e proteger o que importa.</p>
        </div>

        <div className="mt-8">
          {stackGroups.map((group, index) => (
            <StackCarousel key={group.title} group={group} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
