"use client";

import { useEffect, useState, type RefObject } from "react";

type ElementVisibilityOptions = {
  initial?: boolean;
  once?: boolean;
  rootMargin?: string;
};

export function useElementVisibility<T extends Element>(
  ref: RefObject<T | null>,
  { initial = false, once = false, rootMargin = "0px" }: ElementVisibilityOptions = {}
) {
  const [isVisible, setIsVisible] = useState(initial);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, ref, rootMargin]);

  return isVisible;
}
