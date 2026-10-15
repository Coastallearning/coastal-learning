import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { currentProfile } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastal-learning.com";
const TITLE = "Coastal Learning with Lindsay Gagnon";
const DESC = "Private tutoring for Pre-K through grade 6 in Massachusetts, in your home or online. Reading, writing, math, homework and study skills from a teacher with 25+ years of experience. Free consultation, same-day confirmation, and a parent briefing after every session.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: "%s · Coastal Learning" },
  description: DESC,
  keywords: ["tutor", "tutoring", "elementary tutor", "reading tutor", "math tutor", "Pre-K", "kindergarten", "homeschool support", "Massachusetts tutor", "in-home tutoring", "online tutoring", "Lindsay Gagnon", "Coastal Learning"],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: SITE, siteName: "Coastal Learning", title: TITLE, description: "Your child doesn't have to be struggling to benefit from a tutor. Personalized support for early childhood and elementary students.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: TITLE }], locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/opengraph-image"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: { icon: "/icon", apple: "/apple-icon" },
  category: "education",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LocalBusiness", "EducationalOrganization"],
      "@id": `${SITE}/#business`,
      name: "Coastal Learning with Lindsay Gagnon",
      alternateName: "Coastal Learning",
      url: SITE,
      logo: `${SITE}/icon`,
      image: `${SITE}/opengraph-image`,
      description: DESC,
      email: "Lindsaykgagnon@gmail.com",
      founder: { "@type": "Person", "@id": `${SITE}/#lindsay` },
      areaServed: [{ "@type": "State", name: "Massachusetts" }, { "@type": "Place", name: "Online" }],
      priceRange: "$$",
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "15:00", closes: "19:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "15:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "12:00" },
      ],
      makesOffer: [
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Free consultation", description: "A 20-minute conversation about your child, your goals and your schedule." }, price: "0", priceCurrency: "USD" },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Reading and writing tutoring", serviceType: "Tutoring", audience: { "@type": "EducationalAudience", educationalRole: "student", audienceType: "Pre-K through grade 6" } } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Math tutoring", serviceType: "Tutoring" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Homework and study skills support", serviceType: "Tutoring" } },
        { "@type": "Offer", itemOffered: { "@type": "Service", name: "Homeschool support", serviceType: "Tutoring" } },
      ],
      potentialAction: { "@type": "ReserveAction", target: `${SITE}/book`, name: "Schedule a free consultation" },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/#lindsay`,
      name: "Lindsay Gagnon",
      jobTitle: "Tutor and elementary educator",
      worksFor: { "@id": `${SITE}/#business` },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Boston College" },
      hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "degree", name: "Master's degree in Elementary Education" },
      knowsAbout: ["Early childhood education", "Elementary reading and phonics", "Elementary math", "Writing", "Study skills", "Homeschool support"],
      image: `${SITE}/headshot.jpg`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "Coastal Learning",
      publisher: { "@id": `${SITE}/#business` },
      inLanguage: "en-US",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        { "@type": "Question", name: "My child isn't behind. Is tutoring still worth it?", acceptedAnswer: { "@type": "Answer", text: "Yes. Many of Lindsay's students are doing fine at school and come for confidence, enrichment or a steady routine. A little support now can prevent a lot of frustration later, especially before big transitions like starting chapter books or multi-digit math." } },
        { "@type": "Question", name: "In-home or online, which is better?", acceptedAnswer: { "@type": "Answer", text: "Younger children usually do best in-home, where Lindsay can use hands-on materials. Online works well from about second grade up, and the tutoring room keeps sessions interactive. Many families mix both." } },
        { "@type": "Question", name: "How often should we meet?", acceptedAnswer: { "@type": "Answer", text: "Once a week is the most common rhythm. Twice a week helps when a child is catching up on a specific skill or preparing for a transition. Lindsay will recommend a plan after the consultation." } },
        { "@type": "Question", name: "What happens after each session?", acceptedAnswer: { "@type": "Answer", text: "You receive a parent briefing by email, and it is saved in your portal. It covers what was worked on, what went well, what to watch for and one or two simple things to practice at home." } },
        { "@type": "Question", name: "Do you work with my child's teacher?", acceptedAnswer: { "@type": "Answer", text: "With your permission, yes. Lindsay is happy to coordinate with classroom teachers and specialists so that tutoring supports what is happening at school." } },
        { "@type": "Question", name: "What does it cost?", acceptedAnswer: { "@type": "Answer", text: "Rates depend on session length and format. Lindsay will walk you through options during your free consultation, with no pressure to decide on the spot." } },
      ],
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await currentProfile();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Dancing+Script:wght@500;600&family=Nunito+Sans:ital,opsz,wght@0,12..12,400;0,12..12,600;0,12..12,700;0,12..12,800;1,12..12,400&display=swap" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <SiteHeader profile={profile} />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
