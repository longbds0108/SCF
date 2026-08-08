"use client";

import { Fingerprint, Globe, Shield, Zap } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import { useMarquee } from "../hooks/use-marquee";
import { gsap } from "../lib/gsap";

const TRUST_BADGES = [
  { icon: Globe, label: "Built on Stellar" },
  { icon: Zap, label: "~5 second settlement" },
  { icon: Fingerprint, label: "Passkey secured" },
  { icon: Shield, label: "Non-custodial" },
];

export function LandingHero() {
  const headerRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useMarquee<HTMLDivElement>(26);

  useEffect(() => {
    const header = headerRef.current;
    if (!header || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(headlineRef.current, { opacity: 0, y: 24, duration: 0.9 })
        .from(subtextRef.current, { opacity: 0, y: 20, duration: 0.8 }, "-=0.55")
        .from(ctaRef.current, { opacity: 0, y: 16, duration: 0.7 }, "-=0.5")
        .from(trustRef.current, { opacity: 0, y: 12, duration: 0.6 }, "-=0.4");

      gsap.to(imageRef.current, {
        yPercent: 15,
        ease: "none",
        scrollTrigger: {
          trigger: header,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, header);

    return () => ctx.revert();
  }, []);

  function scrollToGetStarted() {
    document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header ref={headerRef} className="relative overflow-hidden bg-foreground">
      <div className="relative h-[min(78vh,640px)] min-h-[440px]">
        <Image
          ref={imageRef}
          src="/images/coastal-cliffs.jpg"
          alt="Coastal cliffs meeting the ocean"
          fill
          priority
          className="object-cover will-change-transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/85" />
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-16 text-center">
          <h1 ref={headlineRef} className="max-w-2xl text-balance text-4xl font-bold text-white sm:text-5xl">
            Global money, at local speed.
          </h1>
          <p ref={subtextRef} className="mt-4 max-w-md text-balance text-white/80">
            Hold XLM and USDC in one wallet. Send anywhere, arrive in seconds — settled on
            Stellar, secured by a passkey instead of a password.
          </p>
          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={scrollToGetStarted}
              className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.97]"
            >
              Create your wallet
            </button>
            <a
              href="#features"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              See what it can do
            </a>
          </div>
        </div>
      </div>

      <div ref={trustRef} className="overflow-hidden border-t border-white/10 bg-foreground py-5">
        <div ref={marqueeTrackRef} className="flex w-max items-center gap-x-16">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-x-16 pr-16"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-background/70"
                >
                  <Icon className="h-4 w-4" /> {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
