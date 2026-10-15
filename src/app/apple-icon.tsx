import { ImageResponse } from "next/og";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: 180, height: 180, background: "#fbf9f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 160, height: 160, borderRadius: 80, background: "#fff", border: "6px solid #1f3764", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        <div style={{ width: 36, height: 42, borderRadius: 20, background: "#8dbfae", marginTop: 20 }} />
        <div style={{ width: 42, height: 58, borderRadius: 24, background: "#2f63b5" }} />
        <div style={{ width: 34, height: 40, borderRadius: 20, background: "#9fd3dc", marginTop: 22 }} />
      </div>
    </div>,
    size,
  );
}
