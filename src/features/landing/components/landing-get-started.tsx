"use client";

import { WalletPanel } from "@/features/auth";

import { useScrollReveal } from "../hooks/use-scroll-reveal";

export function LandingGetStarted() {
  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: true });

  return (
    <section id="get-started" className="border-t border-border bg-secondary/50 py-20">
      <div
        ref={gridRef}
        className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2"
      >
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Get started
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Your wallet, ready in under a minute.
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Create a new Stellar wallet secured by your password and a passkey, or import one you
            already have. No email, no waitlist — you&apos;re in the app.
          </p>
        </div>
        <div className="w-full max-w-sm justify-self-center drop-shadow-2xl">
          <WalletPanel />
        </div>
      </div>
    </section>
  );
}
