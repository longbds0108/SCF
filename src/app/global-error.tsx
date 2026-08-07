"use client";

import { useEffect } from "react";

/**
 * Catches errors thrown by the root layout itself (error.tsx can't — it only covers
 * everything nested inside the layout). This replaces the entire document when it triggers,
 * so it renders its own <html>/<body> and deliberately avoids depending on Providers or any
 * app context that might itself be implicated in the crash.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in the root layout:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            display: "flex",
            minHeight: "100vh",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600 }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", fontSize: "0.875rem", maxWidth: "24rem" }}>
            {error.message || "The app failed to load."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1.5rem",
              borderRadius: "0.375rem",
              backgroundColor: "#0f172a",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
