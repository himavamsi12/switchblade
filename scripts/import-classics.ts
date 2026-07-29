// Bulk-imports classics cards through Payload's real create pipeline (not a direct Supabase
// insert) so each row gets everything a card created by hand in the admin gets: its image
// actually uploaded to Supabase Storage, and the existing afterChange hook on the
// "classics-cards" collection syncing it into public.classics_cards for the live site.
//
// Usage:
//   1. Copy classics-import/data.csv.example to classics-import/data.csv and fill it in.
//   2. Put every image file referenced in that CSV into classics-import/images/.
//   3. npx tsx scripts/import-classics.ts
//
// CSV columns:
//   heading      required — card title, e.g. "Still Life I"
//   category     required — the blue pill tag, e.g. "Seasonal"
//   image        required — filename of the main image, must exist in classics-import/images/
//   gallery      optional — extra image filenames, separated by "|" (e.g. "a.jpg|b.jpg")
//   instagram    optional — a full Instagram URL for this card
//   paragraph    required — body copy; separate multiple paragraphs with "|"
//
// Rows are processed one at a time and a failure on one row doesn't stop the rest — every
// failure is collected and reported in the summary at the end.

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPayload } from "payload";
import WebSocket from "ws";

// The classics-cards afterChange hook's Supabase client eagerly constructs a Realtime client,
// which needs a global WebSocket constructor — present in Next.js's own runtime (dev/Vercel) but
// not in plain Node 20 (added natively in Node 22), so this script never hits it otherwise. We
// never use realtime features here, only plain REST inserts, but the constructor still requires
// this to exist.
if (!("WebSocket" in globalThis)) {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = WebSocket;
}

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "..");

// tsx doesn't auto-load .env.local the way Next.js does — payload.config.ts reads
// process.env.DATABASE_URL etc. at import time, so these need to be set before that config is
// ever imported. A static top-level `import config from "../payload.config.js"` here would get
// hoisted and evaluated before this function runs regardless of source order, so the config
// import below is a dynamic `await import()` done AFTER loadEnvLocal() instead.
function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

type Row = {
  heading: string;
  category: string;
  image: string;
  gallery: string;
  instagram: string;
  paragraph: string;
};

// Minimal RFC4180 CSV parser (quoted fields, embedded commas/newlines, "" escaping) — avoids
// pulling in a CSV library for a single one-off script.
function parseCsv(text: string): Row[] {
  const rows: string[][] = [];
  let field = "", row: string[] = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(v => v !== "")) rows.push(row);
      row = [];
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }

  const [header, ...body] = rows;
  return body.map(cols => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => { obj[key.trim()] = (cols[i] ?? "").trim(); });
    return obj as unknown as Row;
  });
}

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif",
};

function readImageFile(imagesDir: string, filename: string) {
  const filePath = path.join(imagesDir, filename);
  if (!existsSync(filePath)) throw new Error(`Image not found: ${filePath}`);
  const data = readFileSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimetype = MIME_TYPES[ext];
  if (!mimetype) throw new Error(`Unsupported image extension "${ext}" for ${filename}`);
  return { data, mimetype, name: filename, size: data.length };
}

async function main() {
  const csvPath = path.join(root, "classics-import", "data.csv");
  const imagesDir = path.join(root, "classics-import", "images");
  if (!existsSync(csvPath)) {
    console.error(`Missing ${csvPath} — copy data.csv.example to data.csv and fill it in first.`);
    process.exit(1);
  }

  const rows = parseCsv(readFileSync(csvPath, "utf8"));
  console.log(`Found ${rows.length} row(s) in data.csv`);

  const { default: config } = await import("../payload.config.js");
  const payload = await getPayload({ config });
  const failures: { row: number; heading: string; error: string }[] = [];
  let succeeded = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const label = row.heading || `row ${i + 2}`; // +2: header line + 1-indexed
    try {
      if (!row.heading || !row.category || !row.image || !row.paragraph) {
        throw new Error("Missing a required column (heading, category, image, paragraph)");
      }

      const mainImage = readImageFile(imagesDir, row.image);
      const mainMedia = await payload.create({
        collection: "media",
        data: { alt: row.heading },
        file: mainImage,
      });

      const galleryFilenames = row.gallery ? row.gallery.split("|").map(s => s.trim()).filter(Boolean) : [];
      const galleryDocs = [];
      for (const filename of galleryFilenames) {
        const file = readImageFile(imagesDir, filename);
        const media = await payload.create({ collection: "media", data: { alt: row.heading }, file });
        galleryDocs.push({ image: media.id });
      }

      const paragraph = row.paragraph.split("|").map(s => s.trim()).filter(Boolean).join("\n\n");

      await payload.create({
        collection: "classics-cards",
        data: {
          heading: row.heading,
          category: row.category,
          paragraph,
          image: mainMedia.id,
          ...(row.instagram ? { instagram: row.instagram } : {}),
          ...(galleryDocs.length ? { gallery: galleryDocs } : {}),
        },
      });

      succeeded++;
      console.log(`✓ ${label}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push({ row: i + 2, heading: label, error: message });
      console.error(`✗ ${label}: ${message}`);
    }
  }

  console.log(`\n${succeeded}/${rows.length} card(s) created.`);
  if (failures.length) {
    console.log("Failures:");
    failures.forEach(f => console.log(`  line ${f.row} (${f.heading}): ${f.error}`));
  }

  await payload.destroy();
  process.exit(failures.length ? 1 : 0);
}

main();
