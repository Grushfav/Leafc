"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchCmsPagePreview,
  fetchPublishedCmsExperts,
  fetchPublishedCmsPage,
  fetchPublishedFooter,
  fetchPublishedNav,
  fetchPublishedPolicies,
} from "@/lib/cms/api";
import type {
  CmsPageSlug,
  ExpertDraft,
  FooterContent,
  NavContent,
  PageContent,
  PolicyDocument,
} from "@/lib/cms/types";
import { canEditSiteContent } from "@/lib/auth";

function isPreviewQuery() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("preview") === "1";
}

export function usePublishedCmsPage(slug: CmsPageSlug) {
  const { user, token } = useAuth();
  const preview = isPreviewQuery();
  const [content, setContent] = useState<PageContent | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (isPreviewQuery() && token && canEditSiteContent(user)) {
          const data = await fetchCmsPagePreview(token, slug);
          if (!cancelled) setContent(data.page.content);
        } else {
          const published = await fetchPublishedCmsPage(slug);
          if (!cancelled) setContent(published);
        }
      } catch {
        if (!cancelled) setContent(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [slug, token, user]);

  return { content, loaded, preview };
}

export function usePublishedCmsExperts() {
  const [experts, setExperts] = useState<ExpertDraft[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedCmsExperts()
      .then((rows) => {
        if (!cancelled) setExperts(rows);
      })
      .catch(() => {
        if (!cancelled) setExperts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return experts;
}

export function usePublishedNav() {
  const [nav, setNav] = useState<NavContent | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedNav()
      .then((data) => {
        if (!cancelled) setNav(data);
      })
      .catch(() => {
        if (!cancelled) setNav(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return nav;
}

export function usePublishedFooter() {
  const [footer, setFooter] = useState<FooterContent | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedFooter()
      .then((data) => {
        if (!cancelled) setFooter(data);
      })
      .catch(() => {
        if (!cancelled) setFooter(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return footer;
}

export function usePublishedPolicies() {
  const [policies, setPolicies] = useState<
    Array<Pick<PolicyDocument, "slug" | "title" | "description" | "updated" | "badge">> | null
  >(null);
  useEffect(() => {
    let cancelled = false;
    fetchPublishedPolicies()
      .then((data) => {
        if (!cancelled) setPolicies(data);
      })
      .catch(() => {
        if (!cancelled) setPolicies(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return policies;
}
