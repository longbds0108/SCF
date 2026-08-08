import { LandingFaq } from "./landing-faq";
import { LandingFeatures } from "./landing-features";
import { LandingFooter } from "./landing-footer";
import { LandingGetStarted } from "./landing-get-started";
import { LandingHero } from "./landing-hero";
import { LandingNav } from "./landing-nav";

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <LandingNav />
      <LandingHero />
      <LandingFeatures />
      <LandingGetStarted />
      <LandingFaq />
      <LandingFooter />
    </main>
  );
}
