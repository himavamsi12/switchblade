import type { CollectionConfig } from "payload";

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
