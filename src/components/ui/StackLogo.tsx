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

function getSlug(label: string) {
  return stackIconSlugs[label.trim().toLowerCase()];
}

export function StackLogo({ label, className = "h-4 w-4" }: { label: string; className?: string }) {
  const slug = getSlug(label);

  if (slug) {
    return <img src={`https://cdn.simpleicons.org/${slug}/ffffff`} alt="" className={`${className} object-contain`} loading="lazy" />;
  }

  return (
    <span className={`${className} inline-flex items-center justify-center rounded-sm border border-white/15 text-[0.55rem] font-bold text-white`}>
      {label.slice(0, 3).toUpperCase()}
    </span>
  );
}
