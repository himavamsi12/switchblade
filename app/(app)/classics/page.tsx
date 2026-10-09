import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
import { ClassicsPageClient } from "@/components/classics/ClassicsPageClient";
import type { CmsImage, CmsProject } from "@/components/classics/ClassicsExperience";
import { CLASSICS_CARDS_TAG } from "@/lib/classicsCache";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Normalizes one gallery entry into the { url, focalX, focalY } shape the experience renders.
 *
 * Accepts the bare URL string that gallery entries used to be, as well as the current
 * { url, focal_x, focal_y } object — rows are migrated in place by
 * supabase/migrations/0005_classics_cards_focal.sql, but a row written by an older deploy
 * mid-rollout should render with the old centered framing rather than blank out.
 */
function toCmsImage(entry: unknown, fallbackUrl = ""): CmsImage {
  if (typeof entry === "string") return { url: entry, focalX: 50, focalY: 50 };
  const o = (entry ?? {}) as Record<string, unknown>;
  return {
    url: typeof o.url === "string" ? o.url : fallbackUrl,
    focalX: typeof o.focal_x === "number" ? o.focal_x : 50,
    focalY: typeof o.focal_y === "number" ? o.focal_y : 50,
  };
}

export const metadata: Metadata = {
  // The trailing "| SWITCHBLADE™" is gone now that the mark leads the title — repeating the brand
  // at both ends only ate room in the tab and in search results, where titles get truncated.
  title: "SWITCHBLADE™ CLASSICS — The Brand Journey",
  description:
    "From Cosmos to Classic to Evolution — explore the three-phase journey of the SWITCHBLADE™ star, and the archive of inspirations that shaped an unmistakable mark.",
};

/**
 * Data-driven again, but backed by Supabase instead of Payload's own local sqlite db.
 *
 * This used to run `payload.find({ collection: "classics-cards" })` on every request, which can't
 * work on Vercel: Payload's `sqliteAdapter` points at the local file `./payload.db`, which is
 * gitignored (so it's never deployed) and couldn't be read or written anyway on a read-only,
 * ephemeral serverless filesystem. That 500'd in production, so the query was dropped entirely.
 *
 * Cards created/edited in the Payload admin now sync to Supabase's `classics_cards` table (see the
 * afterChange/afterDelete hooks in collections/ClassicsCards.ts) — Postgres has no such local-disk
 * problem on Vercel, so this can safely query it on every request. ClassicsExperience still
 * composes `[...PROJECTS, ...cmsProjects]`, so the hardcoded list keeps working even if this fetch
 * returns nothing (e.g. no cards created yet, or a transient Supabase error).
 */
/**
 * Rendered per request, but the Supabase query is cached for 5 minutes. Going through the
 * cookie-reading server client made every visit wait on a Supabase round trip (measured 1.6-3.6s
 * TTFB in production). The cards are public and identical for everyone, so the result is shared
 * across requests via the data cache, and the Payload sync hooks expire CLASSICS_CARDS_TAG so an
 * edit shows up immediately instead of after the window.
 *
 * Not prerendered (`connection()` below): the Supabase env vars aren't available during the Vercel
 * build, so a static prerender failed the deploy with "supabaseUrl is required".
 *
 * Errors throw inside the cached function so a failed query is never cached; the page falls back
 * to the hardcoded projects for that request instead.
 */
const getCmsProjects = unstable_cache(
  async (): Promise<CmsProject[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("classics_cards")
      .select("heading, category, image_url, image_focal_x, image_focal_y, gallery, body, instagram_url")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    return (data ?? []).map((row) => ({
      title: row.heading,
      cat: row.category,
      img: {
        url: row.image_url,
        focalX: row.image_focal_x ?? 50,
        focalY: row.image_focal_y ?? 50,
      },
      gallery: (row.gallery as unknown[] | null)?.map((g) => toCmsImage(g)) ?? undefined,
      body: (row.body as string[] | null) ?? undefined,
      instagram: row.instagram_url ?? undefined,
    }));
  },
  ["classics-cards"],
  { revalidate: 300, tags: [CLASSICS_CARDS_TAG] },
);

export default async function ClassicsPage() {
  await connection();

  let cmsProjects: CmsProject[] = [];
  try {
    cmsProjects = await getCmsProjects();
  } catch (err) {
    console.error("Failed to fetch classics_cards from Supabase:", err instanceof Error ? err.message : err);
  }

  return <ClassicsPageClient cmsProjects={cmsProjects} />;
}
