"use client";

import { RefObject, useEffect } from "react";
import { getGsap, prefersReducedMotion } from "@/lib/gsap";

export function useTilt<T extends HTMLElement>(ref: RefObject<T | null>) {
  useEffect(() => {
    const element = ref.current;

    if (!element || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) {
      return undefined;
    }

    const { gsap } = getGsap();

    const handleMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      gsap.to(element, {
        rotateY: x * 10,
        rotateX: y * -10,
        scale: 1.025,
        transformPerspective: 900,
        transformOrigin: "center",
        duration: 0.35,
        ease: "power2.out"
      });
    };

    const handleLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out"
      });
    };

    element.addEventListener("mousemove", handleMove);
    element.addEventListener("mouseleave", handleLeave);

    return () => {
      element.removeEventListener("mousemove", handleMove);
      element.removeEventListener("mouseleave", handleLeave);
      gsap.killTweensOf(element);
    };
  }, [ref]);
}
