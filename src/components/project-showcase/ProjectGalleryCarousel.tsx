"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";
import { siteCopy, type Locale } from "@/lib/i18n";
import type { ProjectGalleryImageSize } from "@/lib/projects";

type ProjectGalleryCarouselProps = {
  images: string[];
  sizes: ProjectGalleryImageSize[];
  descriptions: string[];
  title: string;
  fallbackDescription: string;
  locale: Locale;
};

type LoopController = {
  kill: () => void;
  pause: () => void;
  resume: () => void;
};

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getImageClass(size: ProjectGalleryImageSize | undefined) {
  if (size === "small" || size === "medium") {
    return "object-contain p-4 sm:p-6";
  }

  return "object-cover";
}

export function ProjectGalleryCarousel({ images, sizes, descriptions, title, fallbackDescription, locale }: ProjectGalleryCarouselProps) {
  const itemCount = images.length;
  const copy = siteCopy[locale].gallery;
  const canLoop = itemCount > 1;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSetRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const loopRef = useRef<LoopController | null>(null);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const isModalOpen = selectedIndex !== null;
  const copies = useMemo(() => (canLoop ? [0, 1] : [0]), [canLoop]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const firstSet = firstSetRef.current;

    if (!viewport || !track || !firstSet || !canLoop || prefersReducedMotion()) {
      return undefined;
    }

    const { gsap } = getGsap();
    let loop: LoopController | null = null;
    let observer: ResizeObserver | null = null;
    const context = gsap.context(() => {
      const buildLoop = () => {
        loop?.kill();
        const distance = firstSet.getBoundingClientRect().width;

        if (distance <= 0) {
          return;
        }

        gsap.set(track, { x: 0 });
        loop = gsap.to(track, {
          x: -distance,
          duration: Math.max(18, distance / 52),
          ease: "none",
          repeat: -1
        });
        loopRef.current = loop;
      };

      buildLoop();
      observer = new ResizeObserver(buildLoop);
      observer.observe(firstSet);
    }, viewport);

    return () => {
      observer?.disconnect();
      loop?.kill();
      loopRef.current = null;
      context.revert();
    };
  }, [canLoop, itemCount]);

  useEffect(() => {
    if (isHovering || isModalOpen) {
      loopRef.current?.pause();
    } else {
      loopRef.current?.resume();
    }
  }, [isHovering, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowLeft" && canLoop) {
        setSelectedIndex((current) => normalizeIndex((current ?? 0) - 1, itemCount));
      }

      if (event.key === "ArrowRight" && canLoop) {
        setSelectedIndex((current) => normalizeIndex((current ?? 0) + 1, itemCount));
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    let context: { revert: () => void } | undefined;

    if (!prefersReducedMotion() && modalRef.current && modalPanelRef.current) {
      const { gsap } = getGsap();
      context = gsap.context(() => {
        gsap.fromTo(modalRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "power2.out" });
        gsap.fromTo(modalPanelRef.current, { y: 24, scale: 0.985 }, { y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
      }, modalRef);
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      context?.revert();
      previousFocus?.focus();
    };
  }, [canLoop, isModalOpen, itemCount]);

  const selectedDescription = selectedIndex === null
    ? ""
    : descriptions[selectedIndex]?.trim() || fallbackDescription;

  return (
    <div data-project-reveal className="relative left-1/2 mt-8 w-screen -translate-x-1/2">
      <div
        ref={viewportRef}
        className="relative overflow-hidden py-8 sm:py-10"
        role="region"
        aria-roledescription={copy.carousel}
        aria-label={`${copy.galleryOf} ${title}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setHoveredKey(null);
        }}
      >
        <div ref={trackRef} className={`flex w-max will-change-transform ${canLoop ? "" : "mx-auto"}`}>
          {copies.map((copyIndex) => (
            <div
              key={copyIndex}
              ref={copyIndex === 0 ? firstSetRef : undefined}
              className="flex shrink-0 gap-4 pr-4"
              aria-hidden={copyIndex > 0}
            >
              {images.map((src, sourceIndex) => {
                const itemKey = `${copyIndex}-${sourceIndex}`;
                const isHovered = hoveredKey === itemKey;
                const hasHoveredItem = hoveredKey !== null;
                const size = sizes[sourceIndex] ?? "medium";

                return (
                  <figure
                    key={itemKey}
                    className={`relative w-[78vw] max-w-[32rem] shrink-0 transition-[transform,opacity,filter] duration-500 ease-out sm:w-[48vw] lg:w-[36vw] ${isHovered ? "z-10 -translate-y-5 scale-[1.025] opacity-100 blur-0" : hasHoveredItem ? "scale-[0.97] opacity-35 blur-[4px]" : "opacity-100 blur-0"}`}
                    onMouseEnter={() => setHoveredKey(itemKey)}
                    onMouseLeave={() => setHoveredKey(null)}
                  >
                    <button
                      type="button"
                      className="group relative block aspect-[16/10] w-full overflow-hidden border border-white/15 bg-graphite text-left shadow-2xl shadow-black/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                      onClick={() => setSelectedIndex(sourceIndex)}
                      tabIndex={copyIndex === 0 ? 0 : -1}
                      aria-label={`${copy.openScreen} ${sourceIndex + 1}`}
                    >
                      <img
                        src={src}
                        alt={`${title}, ${copy.screen.toLowerCase()} ${sourceIndex + 1}`}
                        loading={copyIndex === 0 && sourceIndex === 0 ? "eager" : "lazy"}
                        className={`h-full w-full transition-transform duration-700 group-hover:scale-[1.015] ${getImageClass(size)}`}
                      />
                      <span className="absolute bottom-0 left-0 flex h-9 items-center bg-ink px-3 font-mono text-[0.58rem] uppercase text-steel">
                        {copy.screen} {String(sourceIndex + 1).padStart(2, "0")}
                      </span>
                    </button>
                  </figure>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between border-y border-white/10 px-5 py-3 sm:px-8">
        <p className="font-mono text-[0.6rem] uppercase text-steel">
          {canLoop ? copy.moving : copy.image}
        </p>
        <span className="font-mono text-[0.58rem] uppercase text-white/30">
          {String(itemCount).padStart(2, "0")} {itemCount === 1 ? copy.singular : copy.plural}
        </span>
      </div>

      {selectedIndex !== null ? createPortal((
        <div
          ref={modalRef}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/85 px-3 py-5 backdrop-blur-md sm:px-6 sm:py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIndex(null);
            }
          }}
        >
          <div
            ref={modalPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-dialog-title"
            className="relative grid w-full max-w-6xl overflow-hidden border border-white/15 bg-ink shadow-2xl lg:grid-cols-[1.55fr_0.75fr]"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center border border-white/20 bg-ink/85 text-ceramic backdrop-blur transition-colors hover:border-coral hover:text-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
              aria-label={copy.closeDetails}
              title={copy.close}
            >
              <X size={18} />
            </button>

            <div className="flex min-h-[18rem] items-center justify-center bg-black/45 p-3 sm:p-6 lg:min-h-[36rem]">
              <img
                src={images[selectedIndex]}
                alt={`${title}, ${copy.screen.toLowerCase()} ${selectedIndex + 1}`}
                className={`max-h-[72vh] w-full ${getImageClass(sizes[selectedIndex])}`}
              />
            </div>

            <div className="flex flex-col border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
              <p className="font-mono text-[0.62rem] uppercase text-mint">{title} / {copy.screen} {String(selectedIndex + 1).padStart(2, "0")}</p>
              <h3 id="gallery-dialog-title" className="mt-5 font-display text-2xl font-semibold text-ceramic">{copy.about}</h3>
              <p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">{selectedDescription}</p>

              {canLoop ? (
                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="font-mono text-[0.58rem] uppercase text-steel">
                    {String(selectedIndex + 1).padStart(2, "0")} / {String(itemCount).padStart(2, "0")}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(normalizeIndex(selectedIndex - 1, itemCount))}
                      className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-ceramic transition-colors hover:border-mint hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                      aria-label={copy.previous}
                      title={copy.previous}
                    >
                      <PortfolioIcon name="left" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedIndex(normalizeIndex(selectedIndex + 1, itemCount))}
                      className="inline-flex h-10 w-10 items-center justify-center border border-white/15 text-ceramic transition-colors hover:border-coral hover:text-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                      aria-label={copy.next}
                      title={copy.next}
                    >
                      <PortfolioIcon name="right" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ), document.body) : null}
    </div>
  );
}
