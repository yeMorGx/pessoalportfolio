"use client";

import { useEffect, useMemo, useState } from "react";

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

function getFaviconCandidates(sourceUrl: string | null) {
  if (!sourceUrl) {
    return [];
  }

  try {
    const parsedUrl = new URL(sourceUrl);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return [];
    }

    const origin = parsedUrl.origin;

    return [
      `${origin}/favicon.ico`,
      `${origin}/favicon.svg`,
      `${origin}/apple-touch-icon.png`,
      `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(origin)}&sz=128`
    ];
  } catch {
    return [];
  }
}

export function ProjectLogo({ title, url, sourceUrl = null, className = "h-10 w-10" }: { title: string; url: string | null; sourceUrl?: string | null; className?: string }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = useMemo(() => {
    const faviconCandidates = getFaviconCandidates(sourceUrl);

    return url ? [url, ...faviconCandidates] : faviconCandidates;
  }, [sourceUrl, url]);

  useEffect(() => {
    setSourceIndex(0);
  }, [sourceUrl, url]);

  const imageSource = sources[sourceIndex];

  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/12 bg-white/[0.04]`} aria-hidden="true">
      {imageSource ? (
        <img
          src={imageSource}
          alt=""
          className="h-full w-full object-contain p-1.5"
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((currentIndex) => currentIndex + 1)}
        />
      ) : (
        <span className="font-mono text-[0.58rem] font-semibold text-mint">{getInitials(title)}</span>
      )}
    </span>
  );
}
