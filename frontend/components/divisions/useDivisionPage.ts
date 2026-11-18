"use client";

import { useMemo } from "react";
import { fetchCmsPagePreview, fetchPublishedCmsPage } from "@/lib/cms/api";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCmsResource,
  type CmsResourceStatus,
} from "@/components/cms/useCmsResource";
import { canEditSiteContent } from "@/lib/auth";
import type { PageContent } from "@/lib/cms/types";
import {
  DIVISION_PAGES,
  mergeDivisionContent,
  type DivisionPageContent,
  type DivisionSlug,
} from "@/lib/division-pages";

function extractDivisionContent(
  content: { sections?: { type: string; content?: Record<string, unknown> }[] } | null,
): Partial<DivisionPageContent> | null {
  const section = content?.sections?.find((item) => item.type === "divisionLayout");
  if (!section?.content) return null;
  return section.content as Partial<DivisionPageContent>;
}

function isPreviewQuery() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

/**
 * Division page copy with loading state. Pages should render a hold
 * placeholder while `status === "loading"` so the built-in copy never flashes.
 */
export function useDivisionPageState(slug: DivisionSlug): {
  content: DivisionPageContent;
  status: CmsResourceStatus;
} {
  const fallback = DIVISION_PAGES[slug];
  const { user, token, isReady } = useAuth();
  const usePreview = isPreviewQuery() && Boolean(token) && canEditSiteContent(user);

  const key = isReady
    ? usePreview
      ? `page:${slug}:preview`
      : `page:${slug}`
    : null;

  const { data, status } = useCmsResource<PageContent | null>(
    key,
    async () => {
      if (usePreview && token) {
        const result = await fetchCmsPagePreview(token, slug);
        return result.page.content;
      }
      return fetchPublishedCmsPage(slug);
    },
    { cache: !usePreview },
  );

  const content = useMemo(() => {
    const remote = extractDivisionContent(data ?? null);
    return remote ? mergeDivisionContent(fallback, remote) : fallback;
  }, [data, fallback]);

  return { content, status };
}

/** Back-compat helper: returns merged content only (no loading state). */
export function useDivisionPage(slug: DivisionSlug): DivisionPageContent {
  return useDivisionPageState(slug).content;
}
