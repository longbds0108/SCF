"use client";

import { useEffect, useRef } from "react";

import { gsap } from "../lib/gsap";

/**
 * Scrolls the track (expected to contain two identical, back-to-back copies of its content)
 * left by exactly half its width on an infinite loop, so the seam is invisible. Pauses on
 * hover, and never animates at all under prefers-reduced-motion — the track just renders its
 * first copy statically.
 */
export function useMarquee<T extends HTMLElement>(durationSeconds = 24) {
  const trackRef = useRef<T | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tween = gsap.to(track, {
      xPercent: -50,
      duration: durationSeconds,
      ease: "none",
      repeat: -1,
    });

    function pause() {
      tween.pause();
    }
    function resume() {
      tween.play();
    }

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);

    return () => {
      tween.kill();
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
    };
  }, [durationSeconds]);

  return trackRef;
}
