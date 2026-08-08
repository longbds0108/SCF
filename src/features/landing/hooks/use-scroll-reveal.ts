"use client";

import { useEffect, useRef } from "react";

import { gsap } from "../lib/gsap";

interface ScrollRevealOptions {
  /** Animate the container's direct children in a staggered sequence instead of the container itself. */
  stagger?: boolean;
}

/**
 * Fades + slides an element (or its direct children, staggered) up into place the first time it
 * scrolls into view. No-ops entirely under prefers-reduced-motion, leaving elements in their
 * normal static layout.
 */
export function useScrollReveal<T extends HTMLElement>({ stagger = false }: ScrollRevealOptions = {}) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const targets = stagger ? Array.from(container.children) : [container];

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y: 32,
        duration: 0.8,
        ease: "power3.out",
        stagger: stagger ? 0.12 : 0,
        scrollTrigger: {
          trigger: container,
          start: "top 82%",
          once: true,
        },
      });
    }, container);

    return () => ctx.revert();
  }, [stagger]);

  return containerRef;
}
