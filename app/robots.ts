import type { MetadataRoute } from "next";

const SITE_URL = "https://switchblade.in";

/**
 * /admin is Payload's CMS panel (see app/(payload)/admin) — a login screen with no content of its
 * own, and not something that should ever show up in search results. Everything under /api is left
 * crawlable on purpose: /api/media/file/* is where every classics card's actual image lives (see
 * ClassicsCards.image_url), and blocking /api wholesale would stop Google Images from ever
 * indexing them.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
