import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Coastal Learning with Lindsay Gagnon";
/** Social share card: brand colors, the wordmark and the promise. */
export default function OG() {
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", background: "linear-gradient(135deg,#cfe2ec 0%,#fbf9f3 60%)", fontFamily: "Georgia, serif", color: "#1f3764", padding: 72 }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#7f9f8a", fontFamily: "sans-serif", fontWeight: 700 }}>PRE-K THROUGH GRADE 6 · IN-HOME &amp; ONLINE</div>
        <div style={{ fontSize: 92, fontWeight: 600, lineHeight: 1, marginTop: 18 }}>Coastal Learning</div>
        <div style={{ fontSize: 44, color: "#7f9f8a", marginTop: 8, fontStyle: "italic" }}>with Lindsay Gagnon</div>
        <div style={{ fontSize: 34, marginTop: 40, lineHeight: 1.3, maxWidth: 760 }}>Your child doesn&apos;t have to be struggling to benefit from a tutor.</div>
        <div style={{ fontSize: 22, marginTop: 36, fontFamily: "sans-serif", color: "#2d3a4f" }}>coastal-learning.com · Free consultation · Same-day confirmation</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 300 }}>
        <div style={{ width: 260, height: 260, borderRadius: 130, background: "#fff", border: "8px solid #1f3764", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ width: 58, height: 68, borderRadius: 32, background: "#8dbfae", marginTop: 34 }} />
          <div style={{ width: 70, height: 96, borderRadius: 40, background: "#2f63b5" }} />
          <div style={{ width: 56, height: 66, borderRadius: 32, background: "#9fd3dc", marginTop: 36 }} />
        </div>
      </div>
    </div>,
    size,
  );
}
