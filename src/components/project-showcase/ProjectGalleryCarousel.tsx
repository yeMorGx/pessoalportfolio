"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PortfolioIcon } from "@/components/ui/PortfolioIcon";
import { prefersReducedMotion } from "@/lib/gsap";
import type { ProjectGalleryImageSize } from "@/lib/projects";

type ProjectGalleryCarouselProps = {
  images: string[];
  sizes: ProjectGalleryImageSize[];
  title: string;
};

const gap = 16;

function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function getImageClass(size: ProjectGalleryImageSize | undefined) {
  if (size === "small" || size === "medium") {
    return "object-contain p-4 sm:p-7";
  }

  return "object-cover";
}

export function ProjectGalleryCarousel({ images, sizes, title }: ProjectGalleryCarouselProps) {
  const itemCount = images.length;
  const canLoop = itemCount > 1;
  const initialIndex = canLoop ? itemCount : 0;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRef = useRef<HTMLElement | null>(null);
  const pointerStartRef = useRef<number | null>(null);
  const suppressClickRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [metrics, setMetrics] = useState({ viewportWidth: 0, slideWidth: 0 });
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const logicalIndex = normalizeIndex(activeIndex, itemCount);

  const renderedImages = useMemo(() => {
    if (!canLoop) {
      return images.map((src, index) => ({ src, sourceIndex: index }));
    }

    return Array.from({ length: itemCount * 3 }, (_, index) => ({
      src: images[index % itemCount],
      sourceIndex: index % itemCount
    }));
  }, [canLoop, images, itemCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const slide = slideRef.current;

    if (!viewport || !slide) {
      return undefined;
    }

    const updateMetrics = () => {
      setMetrics({
        viewportWidth: viewport.clientWidth,
        slideWidth: slide.getBoundingClientRect().width
      });
    };

    updateMetrics();
    const observer = new ResizeObserver(updateMetrics);
    observer.observe(viewport);
    observer.observe(slide);

    return () => observer.disconnect();
  }, [renderedImages.length]);

  const move = useCallback(
    (direction: -1 | 1) => {
      if (!canLoop || isAnimating) {
        return;
      }

      const reducedMotion = prefersReducedMotion();
      setTransitionEnabled(!reducedMotion);

      if (reducedMotion) {
        setActiveIndex((current) => {
          const next = current + direction;

          if (next >= itemCount * 2) {
            return next - itemCount;
          }

          if (next < itemCount) {
            return next + itemCount;
          }

          return next;
        });
        return;
      }

      setIsAnimating(true);
      setActiveIndex((current) => current + direction);
    },
    [canLoop, isAnimating, itemCount]
  );

  const moveToSlide = useCallback(
    (renderedIndex: number) => {
      if (!canLoop || isAnimating || renderedIndex === activeIndex) {
        return;
      }

      const reducedMotion = prefersReducedMotion();
      setTransitionEnabled(!reducedMotion);

      if (reducedMotion) {
        const sourceIndex = normalizeIndex(renderedIndex, itemCount);
        setActiveIndex(itemCount + sourceIndex);
        return;
      }

      setIsAnimating(true);
      setActiveIndex(renderedIndex);
    },
    [activeIndex, canLoop, isAnimating, itemCount]
  );

  const handleTransitionEnd = () => {
    setIsAnimating(false);

    if (!canLoop) {
      return;
    }

    let correctedIndex = activeIndex;

    if (activeIndex >= itemCount * 2) {
      correctedIndex = activeIndex - itemCount;
    } else if (activeIndex < itemCount) {
      correctedIndex = activeIndex + itemCount;
    }

    if (correctedIndex !== activeIndex) {
      setTransitionEnabled(false);
      setActiveIndex(correctedIndex);
      requestAnimationFrame(() => requestAnimationFrame(() => setTransitionEnabled(true)));
    }
  };

  const offset = metrics.viewportWidth / 2 - metrics.slideWidth / 2 - activeIndex * (metrics.slideWidth + gap);

  return (
    <div data-project-reveal className="mt-8">
      <div
        ref={viewportRef}
        className="relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
        role="region"
        aria-roledescription="carrossel"
        aria-label={`Galeria de ${title}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }

          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
        }}
        onPointerDown={(event) => {
          suppressClickRef.current = false;
          pointerStartRef.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStartRef.current === null) {
            return;
          }

          const distance = event.clientX - pointerStartRef.current;
          pointerStartRef.current = null;

          if (Math.abs(distance) >= 42) {
            suppressClickRef.current = true;
            move(distance > 0 ? -1 : 1);
            requestAnimationFrame(() => {
              suppressClickRef.current = false;
            });
          }
        }}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
      >
        <div
          className="flex items-center py-4 will-change-transform sm:py-6"
          style={{
            gap,
            transform: `translate3d(${offset}px, 0, 0)`,
            transition: transitionEnabled ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)" : "none"
          }}
          onTransitionEnd={(event) => {
            if (event.currentTarget === event.target) {
              handleTransitionEnd();
            }
          }}
        >
          {renderedImages.map((image, renderedIndex) => {
            const isActive = renderedIndex === activeIndex;
            const size = sizes[image.sourceIndex] ?? "medium";

            return (
              <figure
                key={`${image.src}-${renderedIndex}`}
                ref={renderedIndex === 0 ? slideRef : undefined}
                className={`relative w-[82vw] max-w-[60rem] shrink-0 transition-[transform,opacity,filter] duration-700 sm:w-[72vw] lg:w-[58vw] ${isActive ? "z-10 scale-100 opacity-100 blur-0" : "scale-[0.86] opacity-35 blur-[3px]"}`}
                aria-hidden={!isActive}
              >
                <button
                  type="button"
                  className="relative block aspect-[16/10] w-full overflow-hidden border border-white/12 bg-graphite text-left shadow-2xl shadow-black/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
                  onClick={(event) => {
                    if (suppressClickRef.current) {
                      event.preventDefault();
                      return;
                    }

                    moveToSlide(renderedIndex);
                  }}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={isActive ? `Imagem ${logicalIndex + 1} de ${itemCount}` : undefined}
                >
                  <img src={image.src} alt={isActive ? `${title}, tela ${logicalIndex + 1}` : ""} loading={isActive ? "eager" : "lazy"} className={`h-full w-full ${getImageClass(size)}`} />
                  <span className="absolute bottom-0 left-0 flex h-9 items-center bg-ink px-3 font-mono text-[0.58rem] uppercase text-steel">
                    Tela {String(image.sourceIndex + 1).padStart(2, "0")}
                  </span>
                </button>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-3 flex max-w-7xl items-center justify-between border-y border-white/10 py-3">
        <p className="font-mono text-[0.6rem] uppercase text-steel" aria-live="polite">
          {String(logicalIndex + 1).padStart(2, "0")} / {String(itemCount).padStart(2, "0")}
        </p>

        {canLoop ? (
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => move(-1)} disabled={isAnimating} className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-ceramic transition-colors hover:border-mint hover:text-mint focus:outline-none focus-visible:ring-2 focus-visible:ring-mint disabled:cursor-wait disabled:opacity-40" aria-label="Imagem anterior" title="Imagem anterior">
              <PortfolioIcon name="left" className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(1)} disabled={isAnimating} className="inline-flex h-11 w-11 items-center justify-center border border-white/15 text-ceramic transition-colors hover:border-coral hover:text-coral focus:outline-none focus-visible:ring-2 focus-visible:ring-coral disabled:cursor-wait disabled:opacity-40" aria-label="Próxima imagem" title="Próxima imagem">
              <PortfolioIcon name="right" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="font-mono text-[0.58rem] uppercase text-white/30">Imagem única</span>
        )}
      </div>
    </div>
  );
}
