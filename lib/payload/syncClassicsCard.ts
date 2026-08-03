import type { Payload } from "payload";
import type { ClassicsCard, Media } from "@/payload-types";
import { createAdminClient } from "@/lib/supabase/admin";

interface SyncedImage {
  url: string;
  focal_x: number;
  focal_y: number;
}

// Resolves a Payload image relation (either a plain numeric ID, if the caller's doc wasn't
// populated with relations, or an already-populated Media doc) down to what the public site needs:
// a URL, plus the focal point an editor set in Payload's "Edit Image" panel.
//
// The URL carries a ?v=<updatedAt> cache buster because Payload's crop tool REPLACES the original
// file at its existing key in Supabase Storage rather than writing a new one (see
// node_modules/payload/dist/uploads/generateFileData.js — the cropped buffer is pushed to
// `${staticPath}/${fsSafeName}`, the same key the uncropped file used). Without the query param
// the object's URL is byte-identical before and after a crop, so browsers and the storage CDN keep
// serving the pre-crop image and the editor quite reasonably concludes the crop "didn't work".
// Payload solves this same problem for its own admin thumbnails via the `cacheTags` upload option,
// which only ever applies inside the admin panel.
//
// focalX/focalY are only persisted once someone actually moves the focal point, so an image nobody
// has adjusted falls back to 50/50 — dead center, which is what every crop on the site did before
// focal points existed.
async function resolveMediaImage(ref: number | Media, payload: Payload): Promise<SyncedImage> {
  const media = typeof ref === "object" ? ref : await payload.findByID({ collection: "media", id: ref });
  const url = media.url ?? "";
  const version = media.updatedAt ? Date.parse(media.updatedAt) : NaN;
  return {
    url: url && Number.isFinite(version) ? `${url}${url.includes("?") ? "&" : "?"}v=${version}` : url,
    focal_x: typeof media.focalX === "number" ? media.focalX : 50,
    focal_y: typeof media.focalY === "number" ? media.focalY : 50,
  };
}

/**
 * Mirrors one Payload classics card into public.classics_cards (Supabase), which is what the
 * deployed site actually reads — it can't query Payload's own db at request time, see
 * app/(app)/classics/page.tsx.
 *
 * Lives here rather than inline in the collection because TWO collections need to trigger it.
 * Editing the card is the obvious one, but an editor cropping a photo or dragging its focal point
 * is editing the MEDIA doc, not the card — that happens in a drawer that saves media and leaves
 * the card untouched, so without the matching hook in collections/Media.ts the adjustment would
 * save correctly in Payload and never reach the site.
 *
 * Throws on failure; callers decide whether that should block an editor's save (none currently do).
 */
export async function syncClassicsCardToSupabase(doc: ClassicsCard, payload: Payload): Promise<void> {
  const image = await resolveMediaImage(doc.image, payload);
  const gallery = doc.gallery?.length
    ? await Promise.all(doc.gallery.map((g) => resolveMediaImage(g.image, payload)))
    : [];
  // Splits on blank lines, matching the admin field's own description ("Leave a blank line between
  // paragraphs to split them") and the site's CmsProject.body: string[] shape.
  const body = doc.paragraph
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const supabase = createAdminClient();
  const { error } = await supabase.from("classics_cards").upsert(
    {
      payload_id: doc.id,
      heading: doc.heading,
      category: doc.category,
      body,
      image_url: image.url,
      image_focal_x: image.focal_x,
      image_focal_y: image.focal_y,
      gallery,
      instagram_url: doc.instagram || null,
    },
    { onConflict: "payload_id" },
  );
  if (error) throw error;
}

/**
 * Re-syncs every classics card that uses a given media doc, as its main image or anywhere in its
 * gallery. Called when a media doc changes so a crop / focal-point adjustment reaches the site.
 *
 * The gallery half of the query walks the array field's `image` relation; Payload's `or` gives us
 * both in a single find rather than two round trips. Cards are re-fetched with depth 0 (relations
 * as plain IDs) because resolveMediaImage re-reads each media doc by ID anyway — and crucially, it
 * must, since the just-updated focal/updatedAt values need to come from the fresh row rather than
 * whatever a populated relation was cached with.
 */
export async function syncCardsUsingMedia(mediaId: number, payload: Payload): Promise<number> {
  const { docs } = await payload.find({
    collection: "classics-cards",
    depth: 0,
    limit: 0,
    where: {
      or: [{ image: { equals: mediaId } }, { "gallery.image": { equals: mediaId } }],
    },
  });
  for (const card of docs) {
    await syncClassicsCardToSupabase(card, payload);
  }
  return docs.length;
}
