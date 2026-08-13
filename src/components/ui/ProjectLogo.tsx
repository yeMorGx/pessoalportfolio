"use client";

import { useEffect, useState } from "react";

function getInitials(title: string) {
  const words = title
    .split(/\s+/)
    .map((word) => word.replace(/[^a-z0-9]/gi, ""))
    .filter(Boolean);

  if (title.trim().startsWith("+") && words[0]) {
    return `+${words[0][0]}`.toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase();
}

export function ProjectLogo({ title, url, className = "h-10 w-10" }: { title: string; url: string | null; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [url]);

  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/12 bg-white/[0.04]`} aria-hidden="true">
      {url && !imageFailed ? (
        <img src={url} alt="" className="h-full w-full object-contain p-1.5" onError={() => setImageFailed(true)} />
      ) : (
        <span className="font-mono text-[0.58rem] font-semibold text-mint">{getInitials(title)}</span>
      )}
    </span>
  );
}
