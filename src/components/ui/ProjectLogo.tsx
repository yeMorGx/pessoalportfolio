"use client";

import { useEffect, useState } from "react";

function getInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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
