import type { CollectionConfig, Payload } from "payload";
import type { Media } from "@/payload-types";
import { createAdminClient } from "@/lib/supabase/admin";

// Resolves a Payload image relation (either a plain numeric ID, if the hook's own doc wasn't
// populated with relations, or an already-populated Media doc) down to its public URL.
async function resolveMediaUrl(ref: number | Media, payload: Payload): Promise<string> {
  const media = typeof ref === "object" ? ref : await payload.findByID({ collection: "media", id: ref });
  return media.url ?? "";
}

export const ClassicsCards: CollectionConfig = {
  slug: "classics-cards",
  labels: {
    singular: "Classics Card",
    plural: "Classics Cards",
  },
  admin: {
    useAsTitle: "heading",
    defaultColumns: ["heading", "category", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  hooks: {
    // Keeps public.classics_cards (Supabase) in sync so the deployed site — which can't reach
    // Payload's own local sqlite db in production, see app/(app)/classics/page.tsx — can still
    // serve whatever gets created/edited here. Sync failures are logged, not thrown: a Supabase
    // hiccup shouldn't block an editor from saving their card in Payload.
    afterChange: [
      async ({ doc, req }) => {
        try {
          const imageUrl = await resolveMediaUrl(doc.image, req.payload);
          const galleryUrls = doc.gallery?.length
            ? await Promise.all(doc.gallery.map((g: { image: number | Media }) => resolveMediaUrl(g.image, req.payload)))
            : [];
          // Splits on blank lines, matching the admin field's own description ("Leave a blank
          // line between paragraphs to split them") and the site's CmsProject.body: string[] shape.
          const body = doc.paragraph
            .split(/\n\s*\n/)
            .map((p: string) => p.trim())
            .filter(Boolean);

          const supabase = createAdminClient();
          const { error } = await supabase.from("classics_cards").upsert(
            {
              payload_id: doc.id,
              heading: doc.heading,
              category: doc.category,
              body,
              image_url: imageUrl,
              gallery: galleryUrls,
              instagram_url: doc.instagram || null,
            },
            { onConflict: "payload_id" },
          );
          if (error) throw error;
        } catch (err) {
          req.payload.logger.error({ err, docId: doc.id }, "Failed to sync classics card to Supabase");
        }
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        try {
          const supabase = createAdminClient();
          const { error } = await supabase.from("classics_cards").delete().eq("payload_id", doc.id);
          if (error) throw error;
        } catch (err) {
          req.payload.logger.error({ err, docId: doc.id }, "Failed to delete synced classics card from Supabase");
        }
      },
    ],
  },
  fields: [
    {
      name: "heading",
      type: "text",
      required: true,
      admin: {
        description: 'Shown as the detail popup title, e.g. "STILL LIFE I" (uppercased automatically).',
      },
    },
    {
      name: "category",
      type: "text",
      required: true,
      admin: {
        description: 'Short tag shown in the blue pill, e.g. "SEASONAL".',
      },
    },
    {
      name: "paragraph",
      type: "textarea",
      required: true,
      admin: {
        description: "Body copy for the detail popup. Leave a blank line between paragraphs to split them.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        description: "Main image shown in the grid tile and as the large image in the detail popup.",
      },
    },
    {
      name: "instagram",
      type: "text",
      admin: {
        description: 'Optional Instagram link, e.g. "https://instagram.com/p/...". Shown as the IG icon in the detail popup.',
      },
    },
    {
      name: "gallery",
      type: "array",
      labels: { singular: "Image", plural: "Gallery Images" },
      admin: {
        description: "Optional extra images. When present, a thumbnail strip appears below the main image in the detail popup so visitors can browse through all the photos for this card.",
      },
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
};
