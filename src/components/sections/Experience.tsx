"use client";

import { Braces, Crosshair, KeyRound, Radar, ShieldAlert, type LucideIcon } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type StackItem = {
  label: string;
  simpleIcon?: string;
  externalIcon?: string;
  wideIcon?: boolean;
  Icon?: LucideIcon;
  customIcon?: "hive";
};

type StackGroup = {
  title: string;
  direction?: "normal" | "reverse";
  items: StackItem[];
};

const stackGroups: StackGroup[] = [
  {
    title: "Dev - Front",
    items: [
      { label: "JavaScript", simpleIcon: "javascript" },
      { label: "TypeScript", simpleIcon: "typescript" },
      { label: "Next.js", simpleIcon: "nextdotjs" },
      { label: "React", simpleIcon: "react" },
      { label: "HTML5", simpleIcon: "html5" },
      { label: "CSS", simpleIcon: "css" }
    ]
  },
  {
    title: "Dev - Back",
    direction: "reverse",
    items: [
      { label: "Python", simpleIcon: "python" },
      { label: "MySQL", simpleIcon: "mysql" },
      { label: "PHP", simpleIcon: "php" },
      { label: "Composer", simpleIcon: "composer" },
      { label: "Laravel", simpleIcon: "laravel" },
      { label: "Rust", simpleIcon: "rust" },
      { label: "PostgreSQL", simpleIcon: "postgresql" },
      { label: "Supabase", simpleIcon: "supabase" },
      { label: "API", Icon: Braces },
      { label: "SSO", Icon: KeyRound }
    ]
  },
  {
    title: "Ciber",
    items: [
      { label: "Wazuh", externalIcon: "https://wazuh.com/brand-assets/Wazuh-Logo.svg", wideIcon: true },
      { label: "TheHive", customIcon: "hive" },
      { label: "OWASP Top 10", simpleIcon: "owasp" },
      { label: "RedTeam", Icon: Crosshair },
      { label: "SOC", Icon: Radar },
      { label: "Threat Defense", Icon: ShieldAlert }
    ]
  }
];

function HiveIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M18 6h12l6 10-6 10H18l-6-10 6-10Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M8 22h12l6 10-6 10H8L2 32l6-10Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M28 22h12l6 10-6 10H28l-6-10 6-10Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

function StackIcon({ item }: { item: StackItem }) {
  if (item.simpleIcon) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${item.simpleIcon}/ffffff`}
        alt=""
        className="h-6 w-6 object-contain"
        loading="lazy"
      />
    );
  }

  if (item.externalIcon) {
    return (
      <img
        src={item.externalIcon}
        alt=""
        className={`${item.wideIcon ? "h-5 w-16" : "h-6 w-6"} object-contain brightness-0 invert`}
        loading="lazy"
      />
    );
  }

  if (item.customIcon === "hive") {
    return <HiveIcon />;
  }

  if (item.Icon) {
    return <item.Icon size={24} strokeWidth={1.8} aria-hidden="true" />;
  }

  return null;
}

function StackCarousel({ group }: { group: StackGroup }) {
  const repeatedItems = [...group.items, ...group.items];

  return (
    <div data-reveal className="overflow-hidden border-y border-white/10 py-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="font-mono text-sm uppercase text-mint">{group.title}</h3>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="stack-marquee" data-direction={group.direction ?? "normal"}>
        <div className="stack-marquee__track">
          {repeatedItems.map((item, index) => (
            <div key={`${item.label}-${index}`} className="stack-pill">
              <StackIcon item={item} />
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
    <section id="stack" ref={ref} className="border-y border-white/10 bg-white/[0.03] px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div data-reveal>
          <p className="font-mono text-sm uppercase text-mint">Stack</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">Stack viva, em camadas de produto e segurança.</h2>
        </div>
        <div className="mt-12 space-y-8">
          {stackGroups.map((group) => (
            <StackCarousel key={group.title} group={group} />
          ))}
        </div>
      </div>
    </section>
  );
}
