import path from "path";
import { fileURLToPath } from "url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";

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
  // Wires up the Media collection's imageSizes/adminThumbnail (see collections/Media.ts) — without
  // this, Payload silently skips generating those resized variants (it warned "Image resizing is
  // enabled... but sharp not installed" even though the package was in package.json, since it was
  // never passed in here).
  sharp,
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  // Postgres (Supabase), not the local sqlite file this used to point at — that only worked in
  // local dev; Vercel's read-only, ephemeral filesystem can't open a local db file, which is why
  // /admin 500'd in production (see classics/page.tsx's own note on the matching problem for the
  // classics-cards data itself). Runs in its own "payload" schema, not "public" — Payload's table
  // naming for the "classics-cards" collection would otherwise collide with this same Supabase
  // project's existing public.classics_cards table (the one the public site reads from, synced by
  // this collection's afterChange hook below).
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
    schemaName: "payload",
    // Auto-pushes schema changes (including in production) instead of requiring generated
    // migrations — the simplest path to get /admin working with no extra deploy steps. Fine for a
    // single-developer project with no production content in Payload's own tables yet; switch to
    // real migrations (payload migrate:create) before this holds anything you can't afford to lose
    // on a schema change.
    push: true,
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
