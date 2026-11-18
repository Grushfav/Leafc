"use client";

import type { ReactNode } from "react";
import { CmsFadeIn, CmsHold } from "@/components/cms/CmsHold";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import {
  useCmsExpertsState,
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
  const { content, status, preview } = usePublishedCmsPage(slug);
  const { experts } = useCmsExpertsState();

  // Hold: never show the built-in copy while published content is still loading.
  if (status === "loading") {
    return <CmsHold />;
  }

  // Failed / slow API / nothing published: show the built-in page.
  if (!content) {
    return <CmsFadeIn>{children}</CmsFadeIn>;
  }

  const hasRenderable = content.sections.some(
    (section) => section.type !== "divisionLayout",
  );
  if (!hasRenderable) {
    return <CmsFadeIn>{children}</CmsFadeIn>;
  }

  return (
    <CmsFadeIn>
      {preview ? (
        <div className="bg-brand-navy px-4 py-2 text-center text-sm text-white">
          Previewing unpublished draft — visitors still see the live published version.
        </div>
      ) : null}
      <SectionRenderer content={content} experts={experts ?? []} slug={slug} />
    </CmsFadeIn>
  );
}
