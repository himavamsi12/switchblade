import type { CollectionConfig } from "payload";
import { syncCardsUsingMedia } from "@/lib/payload/syncClassicsCard";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  hooks: {
    // Pushes crop / focal-point adjustments through to the public site.
    //
    // The classics-cards collection has its own afterChange sync, but it never fires for this:
    // "Edit Image" saves the MEDIA doc, from a drawer that leaves the card document alone. Without
    // this hook an editor would crop a photo, see the crop applied correctly everywhere in the
    // Payload admin, and watch the live site keep showing the old framing — with nothing to do
    // about it short of re-saving the card by hand.
    //
    // Errors are logged rather than thrown, matching the classics-cards hooks: a Supabase hiccup
    // shouldn't reject an image edit that Payload itself already persisted successfully.
    afterChange: [
      async ({ doc, req }) => {
        try {
          await syncCardsUsingMedia(doc.id, req.payload);
        } catch (err) {
          req.payload.logger.error({ err, mediaId: doc.id }, "Failed to re-sync classics cards after media change");
        }
      },
    ],
  },
  upload: {
    staticDir: "media",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 400, fit: "inside" },
    ],
    adminThumbnail: "thumbnail",
    // Both default to true in Payload, but they're spelled out here because the classics gallery
    // depends on them: the "Edit Image" panel on a media doc is the only way an editor can control
    // how a photo gets framed on the site.
    //
    // They do two different jobs, and the classics gallery uses BOTH:
    //   - crop        — hard-crops the file itself. Payload overwrites the original with the
    //                   cropped result (see generateFileData.js), so media.url changes meaning,
    //                   not just the generated sizes. Use this to throw away parts of a photo.
    //   - focalPoint  — stores focalX/focalY (percentages, 0-100) WITHOUT touching the file. The
    //                   site reads them and anchors every cover-crop it does to that point, so
    //                   the subject survives being fitted into boxes of different aspect ratios
    //                   (the 3D panel is ~3:4 portrait, the detail popup's media box is wide).
    //                   See resolveMediaImage in collections/ClassicsCards.ts for where these get
    //                   picked up, and applyCoverUv / applyImage in
    //                   components/classics/ClassicsExperience.tsx for where they get applied.
    crop: true,
    focalPoint: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
};
