"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Route-level error boundary — catches render/effect errors anywhere under this route
 * segment (which for this single-page app is effectively the whole UI) instead of letting
 * one bad render take down the page to a blank screen. Does NOT catch errors thrown by the
 * root layout itself — see global-error.tsx for that.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in the app tree:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <AlertTriangle className="mb-2 h-10 w-10 text-destructive" />
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred."}
          </p>
          <Button type="button" className="w-full" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
