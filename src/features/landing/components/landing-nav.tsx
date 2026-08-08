"use client";

export function LandingNav() {
  function scrollToGetStarted() {
    document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav className="sticky top-0 z-20 bg-foreground text-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 32 32" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 21c2-8 8-14 22-13" strokeLinecap="round" />
              <circle cx="27" cy="8" r="2.6" fill="currentColor" stroke="none" />
            </svg>
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
