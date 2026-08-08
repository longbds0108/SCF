export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm font-semibold">XLMFlow</span>
          <p className="text-xs text-background/60">
            Non-custodial Stellar wallet. Not a bank. Testnet funds have no real-world value.
          </p>
        </div>
      </div>
    </footer>
  );
}
