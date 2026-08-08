import type { SVGProps } from "react";

/**
 * The XLMFlow glyph: two flowing strokes crossing at the center, reading as both an "X" (the
 * XLM ticker) and a pair of currents exchanging places — the brand's "flow" idea. Renders with
 * `currentColor`, so color comes entirely from the parent (text/icon color, not fill).
 */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 4c6 0 6 6.5 8 8s8 2 8 8" />
      <path d="M20 4c-6 0-6 6.5-8 8s-8 2-8 8" />
    </svg>
  );
}
