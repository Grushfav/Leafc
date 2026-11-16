"use client";

import type { ReactNode } from "react";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import {
  usePublishedCmsExperts,
  usePublishedCmsPage,
} from "@/components/cms/usePublishedCms";
import type { CmsPageSlug } from "@/lib/cms/types";

export function CmsOrFallback({
  slug,
  children,
}: {
  slug: CmsPageSlug;
  children: ReactNode;
}) {
  const { content, loaded, preview } = usePublishedCmsPage(slug);
  const experts = usePublishedCmsExperts();

  if (!loaded) {
    return <>{children}</>;
  }

  if (!content) {
    return <>{children}</>;
  }

  const hasRenderable = content.sections.some(
    (section) => section.type !== "divisionLayout",
  );
  if (!hasRenderable) {
    return <>{children}</>;
  }

  return (
    <div>
      {preview ? (
        <div className="bg-brand-navy px-4 py-2 text-center text-sm text-white">
          Previewing unpublished draft — visitors still see the live published version.
        </div>
      ) : null}
      <SectionRenderer content={content} experts={experts ?? []} slug={slug} />
    </div>
  );
}
