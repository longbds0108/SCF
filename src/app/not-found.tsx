import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This wallet is a single-page app — there&apos;s nothing to see at this URL.
      </p>
      <Button asChild>
        <Link href="/">Back to the wallet</Link>
      </Button>
    </main>
  );
}
