import type { MetadataRoute } from "next";

const SITE_URL = "https://switchblade.in";

/**
 * Only the 3 pages actually reachable from the live site (nav + footer both link exactly these).
 * /journal, /membership, /motion, /story, and /concept/3 exist in the codebase but aren't linked
 * from anywhere live — they're unfinished concept pages, not real routes to hand Google.
 *
 * /classics gets a tighter changeFrequency than the rest: new cards land through the Payload CMS
 * independently of any deploy (see app/(app)/classics/page.tsx), so its content changes far more
 * often than the static marketing pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/classics`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/collaborate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
