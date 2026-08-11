import { Braces, Crosshair, KeyRound, Radar, type LucideIcon } from "lucide-react";

const stackIconSlugs: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  next: "nextdotjs",
  "next.js": "nextdotjs",
  react: "react",
  html: "html5",
  html5: "html5",
  css: "css",
  python: "python",
  mysql: "mysql",
  php: "php",
  composer: "composer",
  laravel: "laravel",
  rust: "rust",
  postgresql: "postgresql",
  postgres: "postgresql",
  supabase: "supabase",
  owasp: "owasp",
  "owasp top 10": "owasp"
};

const stackIconUrls: Record<string, string> = {
  wazuh: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wazuh.svg",
  thehive: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/thehive.svg"
};

const genericIcons: Record<string, LucideIcon> = {
  api: Braces,
  sso: KeyRound,
  redteam: Crosshair,
  "red team": Crosshair,
  soc: Radar
};

function getSlug(label: string) {
  return stackIconSlugs[label.trim().toLowerCase()];
}

export function StackLogo({ label, className = "h-4 w-4" }: { label: string; className?: string }) {
  const normalizedLabel = label.trim().toLowerCase();
  const slug = getSlug(label);
  const iconUrl = stackIconUrls[normalizedLabel];
  const GenericIcon = genericIcons[normalizedLabel];

  if (slug) {
    return <img src={`https://cdn.simpleicons.org/${slug}/ffffff`} alt="" className={`${className} object-contain`} loading="lazy" />;
  }

  if (iconUrl) {
    return <img src={iconUrl} alt="" className={`${className} object-contain brightness-0 invert`} loading="lazy" />;
  }

  if (GenericIcon) {
    return <GenericIcon className={className} strokeWidth={1.8} aria-hidden="true" />;
  }

  return (
    <span className={`${className} inline-flex items-center justify-center rounded-sm border border-white/15 text-[0.55rem] font-bold text-white`}>
      {label.slice(0, 3).toUpperCase()}
    </span>
  );
}
