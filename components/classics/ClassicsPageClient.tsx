"use client";

import { SiteNav } from "@/components/shared/SiteNav";
import { ClassicsExperience, type CmsProject } from "@/components/classics/ClassicsExperience";

export function ClassicsPageClient({ cmsProjects }: { cmsProjects: CmsProject[] }) {
  return (
    <>
      <SiteNav variant="light" />
      <ClassicsExperience cmsProjects={cmsProjects} />
    </>
  );
}
