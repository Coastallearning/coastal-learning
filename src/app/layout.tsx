import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { currentProfile } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { default: "Coastal Learning with Lindsay Gagnon", template: "%s · Coastal Learning" },
  description: "Personalized tutoring for Pre-K through grade 6. Reading, writing, math, homework and study skills, in your home or online. Building confidence, inspiring learning.",
  openGraph: { title: "Coastal Learning with Lindsay Gagnon", description: "Your child doesn't have to be struggling to benefit from a tutor.", images: ["/logo.png"] },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await currentProfile();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Dancing+Script:wght@500;600&family=Nunito+Sans:ital,opsz,wght@0,12..12,400;0,12..12,600;0,12..12,700;1,12..12,400&display=swap" />
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <SiteHeader profile={profile} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
