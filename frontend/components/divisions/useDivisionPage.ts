"use client";

import { useEffect, useState } from "react";
import { fetchCmsPagePreview, fetchPublishedCmsPage } from "@/lib/cms/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { canEditSiteContent } from "@/lib/auth";
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

export function useDivisionPage(slug: DivisionSlug): DivisionPageContent {
  const fallback = DIVISION_PAGES[slug];
  const { user, token } = useAuth();
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const preview =
          typeof window !== "undefined" &&
          new URLSearchParams(window.location.search).get("preview") === "1";
        if (preview && token && canEditSiteContent(user)) {
          const data = await fetchCmsPagePreview(token, slug);
          const remote = extractDivisionContent(data.page.content);
          if (!cancelled && remote) {
            setContent(mergeDivisionContent(fallback, remote));
          }
          return;
        }
        const published = await fetchPublishedCmsPage(slug);
        const remote = extractDivisionContent(published);
        if (!cancelled && remote) {
          setContent(mergeDivisionContent(fallback, remote));
        }
      } catch {
        // Keep the built-in copy if the API is unavailable.
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [slug, fallback, token, user]);

  return content;
}
