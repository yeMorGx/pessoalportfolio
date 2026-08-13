"use client";

import { Braces, Crosshair, KeyRound, Radar, type LucideIcon } from "lucide-react";
import { useState } from "react";

const stackIconSlugs: Record<string, string> = {
  javascript: "javascript",
  js: "javascript",
  typescript: "typescript",
  ts: "typescript",
  next: "nextdotjs",
  "next.js": "nextdotjs",
  react: "react",
  "react native": "react",
  "vue.js": "vuedotjs",
  vue: "vuedotjs",
  "nuxt.js": "nuxt",
  nuxt: "nuxt",
  angular: "angular",
  svelte: "svelte",
  "tailwind css": "tailwindcss",
  tailwind: "tailwindcss",
  sass: "sass",
  html: "html5",
  html5: "html5",
  css: "css",
  "node.js": "nodedotjs",
  node: "nodedotjs",
  express: "express",
  nestjs: "nestjs",
  python: "python",
  django: "django",
  fastapi: "fastapi",
  mysql: "mysql",
  php: "php",
  composer: "composer",
  laravel: "laravel",
  java: "openjdk",
  "spring boot": "springboot",
  "c#": "sharp",
  ".net": "dotnet",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  "ruby on rails": "rubyonrails",
  perl: "perl",
  flutter: "flutter",
  dart: "dart",
  kotlin: "kotlin",
  swift: "swift",
  postgresql: "postgresql",
  postgres: "postgresql",
  mariadb: "mariadb",
  mongodb: "mongodb",
  redis: "redis",
  sqlite: "sqlite",
  prisma: "prisma",
  supabase: "supabase",
  firebase: "firebase",
  graphql: "graphql",
  docker: "docker",
  kubernetes: "kubernetes",
  "google cloud": "googlecloud",
  vercel: "vercel",
  "github actions": "githubactions",
  claude: "claude",
  "claude ai": "claude",
  gemini: "googlegemini",
  "google gemini": "googlegemini",
  n8n: "n8n",
  langchain: "langchain",
  "hugging face": "huggingface",
  huggingface: "huggingface",
  ollama: "ollama",
  mcp: "modelcontextprotocol",
  "model context protocol": "modelcontextprotocol",
  "kali linux": "kalilinux",
  owasp: "owasp",
  "owasp top 10": "owasp"
};

const stackIconUrls: Record<string, string> = {
  aws: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/aws.svg",
  azure: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/microsoft-azure.svg",
  wazuh: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/wazuh.svg",
  thehive: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/thehive.svg",
  openai: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/openai.svg",
  codex: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/codex.svg"
};

const genericIcons: Record<string, LucideIcon> = {
  api: Braces,
  rest: Braces,
  sso: KeyRound,
  redteam: Crosshair,
  "red team": Crosshair,
  soc: Radar
};

function getSlug(label: string) {
  return stackIconSlugs[label.trim().toLowerCase()];
}

export function StackLogo({ label, className = "h-4 w-4" }: { label: string; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const normalizedLabel = label.trim().toLowerCase();
  const slug = getSlug(label);
  const iconUrl = stackIconUrls[normalizedLabel];
  const GenericIcon = genericIcons[normalizedLabel];

  if (slug && !imageFailed) {
    return <img src={`https://cdn.simpleicons.org/${slug}/ffffff`} alt="" className={`${className} object-contain`} loading="lazy" onError={() => setImageFailed(true)} />;
  }

  if (iconUrl && !imageFailed) {
    return <img src={iconUrl} alt="" className={`${className} object-contain brightness-0 invert`} loading="lazy" onError={() => setImageFailed(true)} />;
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
