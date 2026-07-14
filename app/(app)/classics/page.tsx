import { getPayload } from "payload";

import config from "@/payload.config";
import { ClassicsPageClient } from "@/components/classics/ClassicsPageClient";
import type { CmsProject } from "@/components/classics/ClassicsExperience";

export const dynamic = "force-dynamic";

export default async function ClassicsPage() {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "classics-cards",
    depth: 1,
    limit: 100,
    sort: "createdAt",
  });

  const cmsProjects: CmsProject[] = docs
    .map((doc) => {
      const image = typeof doc.image === "object" ? doc.image : null;
      const gallery = (doc.gallery ?? [])
        .map((entry) => (typeof entry.image === "object" ? entry.image?.url : null))
        .filter((url): url is string => Boolean(url));
      return {
        title: doc.heading,
        cat: doc.category,
        img: image?.url ?? "",
        gallery,
        body: doc.paragraph
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      };
    })
    .filter((p) => p.img);

  return <ClassicsPageClient cmsProjects={cmsProjects} />;
}
