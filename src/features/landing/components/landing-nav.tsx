"use client";

import { useEffect, useRef } from "react";

import { LogoMark } from "@/components/logo-mark";

import { ScrollTrigger } from "../lib/gsap";

export function LandingNav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const shadowClasses = ["shadow-lg", "shadow-black/30"];
    const trigger = ScrollTrigger.create({
      start: 80,
      end: "max",
      onEnter: () => nav.classList.add(...shadowClasses),
      onLeaveBack: () => nav.classList.remove(...shadowClasses),
    });

    return () => trigger.kill();
  }, []);

  function scrollToGetStarted() {
    document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-20 bg-foreground text-background transition-shadow duration-300"
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LogoMark className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">XLMFlow</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-background/70 sm:flex">
          <a href="#features" className="transition-colors hover:text-background">
            Features
          </a>
          <a href="#faq" className="transition-colors hover:text-background">
            FAQ
          </a>
        </div>
        <button
          type="button"
          onClick={scrollToGetStarted}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          Open wallet
        </button>
      </div>
    </nav>
  );
}
