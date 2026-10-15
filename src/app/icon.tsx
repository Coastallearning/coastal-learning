import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
/** Favicon: navy ring with the three sea-glass pebbles. */
export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 64, height: 64, borderRadius: 32, background: "#fff", border: "3px solid #1f3764", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
      <div style={{ width: 14, height: 16, borderRadius: 8, background: "#8dbfae", marginTop: 8 }} />
      <div style={{ width: 16, height: 22, borderRadius: 9, background: "#2f63b5" }} />
      <div style={{ width: 13, height: 15, borderRadius: 8, background: "#9fd3dc", marginTop: 9 }} />
    </div>,
    size,
  );
}
