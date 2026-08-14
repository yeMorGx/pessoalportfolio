"use client";

import { StackLogo } from "@/components/ui/StackLogo";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { siteCopy, type Locale } from "@/lib/i18n";

type StackGroup = {
  title: string;
  description: string;
  direction?: "normal" | "reverse";
  accent: string;
  items: string[];
};

const stackGroupsBase: Omit<StackGroup, "title" | "description">[] = [
  {
    accent: "text-mint",
    items: ["JavaScript", "TypeScript", "Next.js", "React", "HTML5", "CSS"]
  },
  {
    direction: "reverse",
    accent: "text-coral",
    items: ["Python", "MySQL", "PHP", "Composer", "Laravel", "Rust", "PostgreSQL", "Supabase", "API", "SSO"]
  },
  {
    accent: "text-steel",
    items: ["Wazuh", "TheHive", "OWASP Top 10", "RedTeam", "SOC"]
  },
  {
    direction: "reverse",
    accent: "text-mint",
    items: ["OpenAI", "Codex", "Claude", "Gemini", "n8n", "LangChain", "Hugging Face", "Ollama", "MCP"]
  }
];

function StackCarousel({ group, index, technologiesLabel }: { group: StackGroup; index: number; technologiesLabel: string }) {
  const repeatedItems = [
    ...group.items.map((label) => ({ label, clone: false })),
    ...group.items.map((label) => ({ label, clone: true }))
  ];

  return (
    <div data-reveal className="border-t border-white/10 py-7 last:border-b">
      <div className="mb-5 grid gap-2 md:grid-cols-[10rem_1fr_auto] md:items-center md:gap-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[0.58rem] text-white/25">{String(index + 1).padStart(2, "0")}</span>
          <h3 className={`font-mono text-[0.68rem] uppercase ${group.accent}`}>{group.title}</h3>
        </div>
        <p className="text-xs leading-5 text-steel sm:text-sm">{group.description}</p>
        <span className="hidden font-mono text-[0.58rem] uppercase text-white/25 md:block">{group.items.length} {technologiesLabel}</span>
      </div>

      <div className="stack-marquee border-y border-white/10 bg-ink/45" data-direction={group.direction ?? "normal"} role="list" aria-label={group.title}>
        <div className="stack-marquee__track">
          {repeatedItems.map((item, itemIndex) => (
            <div key={`${item.label}-${itemIndex}`} className="stack-pill" role={item.clone ? undefined : "listitem"} aria-hidden={item.clone ? true : undefined} data-clone={item.clone ? "true" : undefined}>
              <StackLogo label={item.label} className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Experience({ locale }: { locale: Locale }) {
  const ref = useScrollReveal<HTMLElement>();
  const copy = siteCopy[locale].experience;
  const stackGroups = stackGroupsBase.map((group, index) => ({
    ...group,
    title: copy.groups[index][0],
    description: copy.groups[index][1]
  }));

  return (
    <section id="stack" ref={ref} className="border-y border-white/10 bg-graphite px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div data-reveal className="flex items-center justify-between border-b border-white/12 pb-4 font-mono text-[0.65rem] uppercase text-steel">
          <span>{copy.sectionLabel}</span>
          <span>03</span>
        </div>

        <div data-reveal className="grid gap-5 border-b border-white/12 py-8 lg:grid-cols-[1fr_25rem] lg:items-end lg:py-10">
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.08] text-ceramic sm:text-4xl lg:text-5xl">{copy.heading}</h2>
          <p className="max-w-md text-sm leading-6 text-steel sm:text-base sm:leading-7">{copy.body}</p>
        </div>

        <div>
          {stackGroups.map((group, index) => (
            <StackCarousel key={group.title} group={group} index={index} technologiesLabel={copy.technologies} />
          ))}
        </div>
      </div>
    </section>
  );
}
