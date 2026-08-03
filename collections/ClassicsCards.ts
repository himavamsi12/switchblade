import type { CollectionConfig } from "payload";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncClassicsCardToSupabase } from "@/lib/payload/syncClassicsCard";

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
    //
    // The sync body itself lives in lib/payload/syncClassicsCard.ts because collections/Media.ts
    // needs to run it too — cropping a photo or moving its focal point edits the media doc, not
    // the card, so this hook never fires for those.
    afterChange: [
      async ({ doc, req }) => {
        try {
          await syncClassicsCardToSupabase(doc, req.payload);
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
        description:
          "Main image shown in the grid tile and as the large image in the detail popup. " +
          'To control how it gets framed, open the image and use "Edit Image": drag the focal point ' +
          "to whatever must stay visible (a face, the product) and the site anchors every crop to it, " +
          "or use the crop tool to cut the photo down permanently. Saving the image is enough — the " +
          "card updates on its own.",
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
        description:
          "Optional extra images. When present, a thumbnail strip appears below the main image in " +
          "the detail popup so visitors can browse through all the photos for this card. Each one " +
          'takes its own focal point and crop via "Edit Image", same as the main image above.',
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
