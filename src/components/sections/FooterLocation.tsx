"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { prefersReducedMotion } from "@/lib/gsap";
import { siteCopy, type Locale } from "@/lib/i18n";

const LocationGlobe = dynamic(() => import("@/components/three/LocationGlobe").then((module) => module.LocationGlobe), { ssr: false });

const mapsUrl = "https://www.google.com/maps/search/?api=1&query=-23.962,-46.363";

export function FooterLocation({ locale }: { locale: Locale }) {
  const locationRef = useRef<HTMLAnchorElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const shouldLoadGlobe = useElementVisibility(locationRef, { once: true, rootMargin: "600px 0px" });
  const globeActive = useElementVisibility(locationRef, { rootMargin: "120px 0px" });
  const copy = siteCopy[locale].location;

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

  return (
    <a
      ref={locationRef}
      href={mapsUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={copy.ariaLabel}
      className="group relative mt-14 grid min-h-[19rem] overflow-hidden border-y border-ink/15 text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-coral sm:mt-20 lg:grid-cols-[0.8fr_1.2fr]"
    >
      <div className="relative z-10 flex flex-col justify-between py-6 lg:py-8">
        <div className="flex items-center gap-2 font-mono text-[0.58rem] uppercase text-ink/45">
          <MapPin size={13} className="text-coral" />
          {copy.base}
        </div>

        <div className="mt-10 max-w-md lg:mt-0">
          <p className="font-mono text-[0.6rem] uppercase text-coral">23.962° S / 46.363° W</p>
          <h3 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">Santos / São Vicente</h3>
          <p className="mt-3 text-sm leading-6 text-ink/60">{copy.body}</p>
        </div>

        <span className="mt-8 inline-flex w-fit items-center gap-2 text-xs font-semibold">
          {copy.map}
          <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>

      <div className="relative min-h-[17rem] lg:min-h-[22rem]" aria-hidden="true">
        <div className="technical-grid absolute inset-0 opacity-35" />
        <div className="absolute inset-[-12%] transition-transform duration-700 ease-out group-hover:scale-[1.025]">
          {shouldLoadGlobe ? <LocationGlobe active={globeActive} reducedMotion={reducedMotion} /> : null}
        </div>
      </div>
    </a>
  );
}
