"use client";

import { useEffect, useState } from "react";
import { fetchPublishedDivision } from "@/lib/content";
import {
  DIVISION_PAGES,
  mergeDivisionContent,
  type DivisionPageContent,
  type DivisionSlug,
} from "@/lib/division-pages";

export function useDivisionPage(slug: DivisionSlug): DivisionPageContent {
  const fallback = DIVISION_PAGES[slug];
  const [content, setContent] = useState(fallback);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedDivision(slug)
      .then((remote) => {
        if (!cancelled && remote) {
          setContent(mergeDivisionContent(fallback, remote));
        }
      })
      .catch(() => {
        // Keep the built-in copy if the API is unavailable.
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fallback]);

  return content;
}
