import type { MetadataRoute } from "next";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastal-learning.com";
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE}/book`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
