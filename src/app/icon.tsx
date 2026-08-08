import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Same glyph as components/logo-mark.tsx, redrawn as static markup — the ImageResponse/satori
// renderer used for favicons doesn't run through React components from the rest of the app.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#21c45d",
        borderRadius: 6,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4c6 0 6 6.5 8 8s8 2 8 8" />
        <path d="M20 4c-6 0-6 6.5-8 8s-8 2-8 8" />
      </svg>
    </div>,
    size,
  );
}
