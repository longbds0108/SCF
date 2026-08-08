"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    q: "Is this real money, on a real network?",
    a: "XLMFlow runs on Stellar. You can use it on Testnet with free, worthless test tokens while you get comfortable, then switch to Mainnet from the dashboard whenever you're ready to use real XLM and USDC.",
  },
  {
    q: "What is a passkey, and why not just a password?",
    a: "A passkey uses your device's built-in biometrics — Face ID, Touch ID, or your fingerprint — instead of a password you have to remember and type. Your wallet still keeps its own password-encrypted key as well; the passkey adds a device-level sign-in step on top.",
  },
  {
    q: "Who holds my private key?",
    a: "You do. It's encrypted with your password and stored on your device, decrypted only in memory while you use the app. XLMFlow has no server-side custody of your funds.",
  },
  {
    q: "What can I actually do with the Soroban explorer?",
    a: "Enter any deployed Soroban contract address, simulate a function call to preview the result, invoke it for real with your wallet, and read the contract's stored data — directly from the app, no separate CLI needed.",
  },
];

export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
      <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
        Frequently asked questions
      </h2>
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-foreground">{item.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen ? (
                <p className="px-6 pb-5 text-sm text-muted-foreground">{item.a}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
