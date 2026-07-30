import type { Metadata } from "next";
import { ClassicsPageClient } from "@/components/classics/ClassicsPageClient";
import type { CmsProject } from "@/components/classics/ClassicsExperience";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SWITCHBLADE CLASSICS — The Brand Journey | SWITCHBLADE™",
  description:
    "From Cosmos to Classic to Evolution — explore the three-phase journey of the Switchblade star, and the archive of inspirations that shaped an unmistakable mark.",
};

/**
 * Dynamic again, but backed by Supabase instead of Payload's own local sqlite db.
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
export default async function ClassicsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classics_cards")
    .select("heading, category, image_url, gallery, body, instagram_url")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch classics_cards from Supabase:", error.message);
  }

  const cmsProjects: CmsProject[] = (data ?? []).map((row) => ({
    title: row.heading,
    cat: row.category,
    img: row.image_url,
    gallery: (row.gallery as string[] | null) ?? undefined,
    body: (row.body as string[] | null) ?? undefined,
    instagram: row.instagram_url ?? undefined,
  }));

  return <ClassicsPageClient cmsProjects={cmsProjects} />;
}
