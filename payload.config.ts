import path from "path";
import { fileURLToPath } from "url";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";

import { ClassicsCards } from "./collections/ClassicsCards";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, ClassicsCards],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: "file:./payload.db",
    },
  }),
  // Uploads go straight to Supabase Storage (S3-compatible) instead of local disk — local files
  // don't exist on Vercel's read-only, ephemeral filesystem (same reason the "classics-cards"
  // collection itself can't be queried at request time in production, see classics/page.tsx), so
  // without this every image uploaded through the Payload admin would 404 once deployed, even
  // though it displays fine in local dev.
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: process.env.SUPABASE_S3_BUCKET || "media",
      config: {
        region: process.env.SUPABASE_S3_REGION,
        endpoint: process.env.SUPABASE_S3_ENDPOINT,
        // Supabase's S3-compatible endpoint requires path-style bucket addressing
        // (endpoint/bucket/key), not the virtual-hosted-style (bucket.endpoint/key) the AWS SDK
        // defaults to.
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY || "",
        },
      },
    }),
  ],
});
