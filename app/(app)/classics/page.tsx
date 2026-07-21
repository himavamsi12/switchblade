import { ClassicsPageClient } from "@/components/classics/ClassicsPageClient";

/**
 * Static page — deliberately NOT backed by Payload.
 *
 * This used to be `force-dynamic` and ran `payload.find({ collection: "classics-cards" })` on every
 * request. That can't work on Vercel: the Payload config points `sqliteAdapter` at the local file
 * `./payload.db`, which is gitignored (so it's never deployed) and couldn't be read or written
 * anyway on a read-only, ephemeral serverless filesystem. The result was a 500 on /classics in
 * production while every other (static) route was fine.
 *
 * Nothing was lost by dropping the query: the `classics-cards` collection was empty (0 rows), and
 * ClassicsExperience composes its cards as `[...PROJECTS, ...cmsProjects]` — so the CMS array only
 * ever appended to the hardcoded PROJECTS list, and was always appending nothing.
 *
 * To add or edit cards, edit PROJECTS in components/classics/ClassicsExperience.tsx.
 */
export default function ClassicsPage() {
  return <ClassicsPageClient cmsProjects={[]} />;
}
