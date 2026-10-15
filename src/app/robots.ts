import type { MetadataRoute } from "next";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coastal-learning.com";
/** Public pages are open to search engines and AI assistants; private areas are kept out of every index. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ["/portal", "/admin", "/room", "/auth", "/welcome", "/api"];
  const bots = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "Amazonbot", "DuckAssistBot", "meta-externalagent", "CCBot"];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }, ...bots.map((userAgent) => ({ userAgent, allow: "/", disallow }))],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
