"use client";

import { ArrowUpRight, KeyRound, TerminalSquare, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ScrollTrigger } from "../lib/gsap";

const STEPS = [
  {
    title: "Create your wallet",
    body: "Choose a password, save your secret key once, and you're in — no email, no waitlist.",
  },
  {
    title: "Fund it in seconds",
    body: "Grab free Testnet XLM instantly, or receive real XLM and USDC from anywhere on Stellar.",
  },
  {
    title: "Send, explore, hold",
    body: "Pay a friend, add a trustline for any asset, or connect straight to a Soroban contract.",
  },
];

export function LandingHowItWorks() {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const triggers = STEPS.map((_, index) => {
      const el = stepRefs.current[index];
      if (!el) return null;
      return ScrollTrigger.create({
        trigger: el,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) setActiveIndex(index);
        },
      });
    });

    return () => triggers.forEach((trigger) => trigger?.kill());
  }, []);

  return (
    <section id="how-it-works" className="border-t border-border bg-background py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-14 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            From zero to funded in three steps.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                className={`flex min-h-[45vh] flex-col justify-center border-l-2 py-6 pl-6 transition-colors duration-300 lg:min-h-[60vh] ${
                  activeIndex === index ? "border-primary" : "border-border"
                }`}
              >
                <span
                  className={`text-sm font-bold transition-colors duration-300 ${
                    activeIndex === index ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative h-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
                <div
                  className={`absolute inset-0 flex flex-col justify-center gap-4 p-8 transition-opacity duration-500 ${
                    activeIndex === 0 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <KeyRound className="h-4 w-4 text-primary" /> Create a new wallet
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Password</span>
                    <div className="h-9 rounded-md border border-input bg-background" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Confirm password</span>
                    <div className="h-9 rounded-md border border-input bg-background" />
                  </div>
                  <div className="mt-1 rounded-md bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground">
                    Create wallet
                  </div>
                </div>

                <div
                  className={`absolute inset-0 flex flex-col justify-center gap-3 p-8 transition-opacity duration-500 ${
                    activeIndex === 1 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Wallet className="h-4 w-4 text-primary" /> Native balance
                  </div>
                  <div className="text-4xl font-bold text-foreground">10,000.00 XLM</div>
                  <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    Funded via Friendbot
                  </span>
                </div>

                <div
                  className={`absolute inset-0 flex flex-col justify-center gap-3 p-8 transition-opacity duration-500 ${
                    activeIndex === 2 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ArrowUpRight className="h-4 w-4 text-primary" /> Send XLM
                    </span>
                    <span className="text-xs text-muted-foreground">Testnet</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <TerminalSquare className="h-4 w-4 text-primary" /> Soroban explorer
                    </span>
                    <span className="text-xs text-muted-foreground">Connect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
