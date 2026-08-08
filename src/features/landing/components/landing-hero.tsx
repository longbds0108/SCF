"use client";

import { Fingerprint, Globe, Shield, Zap } from "lucide-react";
import Image from "next/image";

export function LandingHero() {
  function scrollToGetStarted() {
    document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header className="relative overflow-hidden bg-foreground">
      <div className="relative h-[min(78vh,640px)] min-h-[440px]">
        <Image
          src="/images/coastal-cliffs.jpg"
          alt="Coastal cliffs meeting the ocean"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/85" />
        <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-16 text-center">
          <h1 className="max-w-2xl text-balance text-4xl font-bold text-white sm:text-5xl">
            Global money, at local speed.
          </h1>
          <p className="mt-4 max-w-md text-balance text-white/80">
            Hold XLM and USDC in one wallet. Send anywhere, arrive in seconds — settled on
            Stellar, secured by a passkey instead of a password.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

      <div className="border-t border-white/10 bg-foreground py-5">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6">
          <span className="flex items-center gap-2 text-xs font-semibold text-background/70">
            <Globe className="h-4 w-4" /> Built on Stellar
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-background/70">
            <Zap className="h-4 w-4" /> ~5 second settlement
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-background/70">
            <Fingerprint className="h-4 w-4" /> Passkey secured
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-background/70">
            <Shield className="h-4 w-4" /> Non-custodial
          </span>
        </div>
      </div>
    </header>
  );
}
