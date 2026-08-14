"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import type { Locale } from "@/lib/i18n";

export function PageLoader({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(true);
  const isPortuguese = locale === "pt";

  useEffect(() => {
    const root = rootRef.current;
    let disposed = false;

    if (!root) {
      return undefined;
    }

    const finish = () => {
      if (!disposed) {
        setVisible(false);
      }
    };

    if (prefersReducedMotion()) {
      const timeout = window.setTimeout(finish, 180);

      return () => {
        disposed = true;
        window.clearTimeout(timeout);
      };
    }

    const { gsap } = getGsap();
    const context = gsap.context(() => {
      gsap.timeline({ onComplete: finish })
        .fromTo("[data-loader-frame]", { autoAlpha: 0, scale: 0.78, rotate: -8 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.65, ease: "power3.out" })
        .fromTo("[data-loader-logo] [data-loader-piece]", { autoAlpha: 0, y: 14, scale: 0.84 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.72, stagger: 0.12, ease: "back.out(1.6)" }, "-=0.28")
        .fromTo("[data-loader-logo] [data-loader-orbit]", { autoAlpha: 0, scale: 0.52, rotate: -90 }, { autoAlpha: 0.55, scale: 1, rotate: 0, duration: 1.05, ease: "power2.out" }, "-=0.72")
        .fromTo("[data-loader-label]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.48, ease: "power2.out" }, "-=0.48")
        .to("[data-loader-progress]", { scaleX: 1, duration: 0.86, ease: "power2.inOut" }, "-=0.35")
        .to(root, { autoAlpha: 0, duration: 0.58, ease: "power2.inOut", delay: 0.16 });
    }, root);

    return () => {
      disposed = true;
      context.revert();
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div ref={rootRef} className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-ink" aria-hidden="true">
      <div className="relative flex flex-col items-center px-6 text-center">
        <div data-loader-frame className="absolute -inset-12 border border-white/10 opacity-0 sm:-inset-16">
          <span className="absolute -left-px -top-px h-8 w-px bg-mint" />
          <span className="absolute -bottom-px -right-px h-px w-10 bg-coral" />
        </div>

        <div data-loader-logo className="relative h-28 w-28 text-ceramic sm:h-36 sm:w-36">
          <AnimatedLogo animated className="h-full w-full" />
        </div>

        <div data-loader-label className="mt-9 opacity-0">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-mint">
            {isPortuguese ? "Inicializando sistema" : "Initializing system"}
          </p>
          <p className="mt-2 text-xs text-steel">
            {isPortuguese ? "Interface / Produto / Sistemas" : "Interface / Product / Systems"}
          </p>
        </div>

        <div className="mt-8 h-px w-40 overflow-hidden bg-white/10 sm:w-52">
          <span data-loader-progress className="block h-full origin-left scale-x-0 bg-mint" />
        </div>
      </div>
    </div>
  );
}
