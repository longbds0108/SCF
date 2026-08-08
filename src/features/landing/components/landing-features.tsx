"use client";

import { Fingerprint, Globe2, History, Layers, ShieldCheck, TerminalSquare } from "lucide-react";

import { useScrollReveal } from "../hooks/use-scroll-reveal";

const FEATURES = [
  {
    icon: Layers,
    title: "One wallet, every asset",
    body: "XLM and USDC out of the box, plus any Stellar-issued asset you add a trustline for.",
    span: "sm:col-span-2",
  },
  {
    icon: TerminalSquare,
    title: "Soroban contract explorer",
    body: "Connect to any deployed contract by address, simulate a call before you commit to it, invoke it for real, and read its storage directly — no separate tooling.",
    span: "sm:col-span-2 sm:row-span-2",
    highlight: true,
  },
  {
    icon: Fingerprint,
    title: "Passkey security",
    body: "Face ID, Touch ID, or your device's biometrics — no password to type on every sign-in.",
    span: "",
  },
  {
    icon: History,
    title: "Full transaction history",
    body: "Every payment, in or out, pulled straight from the Stellar ledger — not a cached copy.",
    span: "",
  },
  {
    icon: Globe2,
    title: "Testnet & Mainnet",
    body: "Switch networks from the dashboard. Build and test safely before moving real funds.",
    span: "",
  },
  {
    icon: ShieldCheck,
    title: "Non-custodial by design",
    body: "Your key is encrypted on your device and decrypted only in memory. XLMFlow never sees it.",
    span: "",
  },
];

export function LandingFeatures() {
  const gridRef = useScrollReveal<HTMLDivElement>({ stagger: true });

  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10 max-w-xl">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Why XLMFlow
        </span>
        <h2 className="mt-3 text-3xl font-bold text-foreground">
          Everything a Stellar wallet needs. Nothing it doesn&apos;t.
        </h2>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className={`flex flex-col justify-between gap-4 rounded-2xl border p-6 ${feature.span} ${
              feature.highlight
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card"
            }`}
          >
            <feature.icon
              className={`h-6 w-6 ${feature.highlight ? "text-primary" : "text-primary"}`}
            />
            <div>
              <h3 className={`font-semibold ${feature.highlight ? "text-background" : "text-foreground"}`}>
                {feature.title}
              </h3>
              <p
                className={`mt-1.5 text-sm ${
                  feature.highlight ? "text-background/70" : "text-muted-foreground"
                }`}
              >
                {feature.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
