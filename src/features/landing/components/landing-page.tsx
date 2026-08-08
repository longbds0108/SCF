"use client";

import { useLenisScroll } from "../hooks/use-lenis-scroll";
import { LandingFaq } from "./landing-faq";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingGetStarted } from "./landing-get-started";
import { LandingHero } from "./landing-hero";
import { LandingHowItWorks } from "./landing-how-it-works";
import { LandingNav } from "./landing-nav";

export function LandingPage() {
  useLenisScroll();

  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingGetStarted />
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}
