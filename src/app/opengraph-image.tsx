import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Coastal Learning with Lindsay Gagnon";

const root = process.cwd();
const art = async (name: string) => `data:image/png;base64,${(await readFile(join(root, "public/art", name))).toString("base64")}`;

/** Social share card: the site's own fonts, logo pebbles and watercolor art, so a pasted link looks like the site. */
export default async function OG() {
  const [cormorant, dancing, nunito, pebbles, leaves, starfish, shell] = await Promise.all([
    readFile(join(root, "src/app/fonts/cormorant-600.woff")),
    readFile(join(root, "src/app/fonts/dancing-600.woff")),
    readFile(join(root, "src/app/fonts/nunito-700.woff")),
    art("pebbles.png"),
    art("glass-leaves.png"),
    art("starfish.png"),
    art("shell-glass.png"),
  ]);
  const navy = "#1f3764", sage = "#7f9f8a";
  return new ImageResponse(
    <div style={{ width: 1200, height: 630, display: "flex", position: "relative", background: "linear-gradient(180deg,#cfe2ec 0%,#fbf9f3 70%)", color: navy, overflow: "hidden" }}>
      {/* watercolor pieces from the flyers */}
      <img src={leaves} width={300} height={309} style={{ position: "absolute", left: -40, top: -50, opacity: 0.85 }} />
      <img src={shell} width={230} height={291} style={{ position: "absolute", left: 20, bottom: -120, opacity: 0.8 }} />
      <img src={starfish} width={200} height={315} style={{ position: "absolute", right: -30, bottom: -90, opacity: 0.9 }} />

      {/* words */}
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", position: "absolute", left: 215, top: 0, height: 630, width: 560 }}>
        <div style={{ fontFamily: "Nunito Sans", fontSize: 18, letterSpacing: 5, color: sage }}>PRE-K TO GRADE 6 · IN-HOME &amp; ONLINE</div>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 96, lineHeight: 0.98, marginTop: 14, letterSpacing: 1 }}>Coastal Learning</div>
        <div style={{ fontFamily: "Dancing Script", fontSize: 50, color: navy, marginTop: 6 }}>with Lindsay Gagnon</div>
        <div style={{ fontFamily: "Cormorant Garamond", fontSize: 32, lineHeight: 1.25, marginTop: 28, color: "#2d3a4f", maxWidth: 540 }}>Your child doesn&apos;t have to be struggling to benefit from a tutor.</div>
        <div style={{ fontFamily: "Nunito Sans", fontSize: 20, marginTop: 30, color: sage, letterSpacing: 1 }}>coastal-learning.com · Free consultation</div>
      </div>

      {/* the logo ring */}
      <div style={{ position: "absolute", right: 60, top: 135, width: 360, height: 360, borderRadius: 180, background: "#ffffff", border: `5px solid ${navy}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 40px rgba(31,55,100,.18)" }}>
        <div style={{ width: 330, height: 330, borderRadius: 165, border: `2px solid ${sage}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <img src={pebbles} width={176} height={76} style={{ marginTop: -6 }} />
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 54, lineHeight: 1, marginTop: 8, letterSpacing: 1 }}>Coastal</div>
          <div style={{ fontFamily: "Cormorant Garamond", fontSize: 42, lineHeight: 1, marginTop: 4, letterSpacing: 5, color: sage }}>Learning</div>
          <div style={{ fontFamily: "Dancing Script", fontSize: 32, marginTop: 8 }}>Lindsay Gagnon</div>
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Cormorant Garamond", data: cormorant, weight: 600, style: "normal" },
        { name: "Dancing Script", data: dancing, weight: 600, style: "normal" },
        { name: "Nunito Sans", data: nunito, weight: 700, style: "normal" },
      ],
    },
  );
}
