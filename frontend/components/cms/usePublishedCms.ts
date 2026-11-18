"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  useCmsResource,
  type CmsResourceStatus,
} from "@/components/cms/useCmsResource";
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

export type { CmsResourceStatus };

/** True once the request has settled (data, failure, or slow-API timeout). */
export function isSettled(status: CmsResourceStatus) {
  return status !== "loading";
}

export function usePublishedCmsPage(slug: CmsPageSlug) {
  const { user, token, isReady } = useAuth();
  const preview = isPreviewQuery();
  const usePreview = preview && Boolean(token) && canEditSiteContent(user);

  // Wait for auth to resolve so we make one request (published or draft), not two.
  const key = isReady ? (usePreview ? `page:${slug}:preview` : `page:${slug}`) : null;

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

  return {
    content: data ?? null,
    loaded: isSettled(status),
    status,
    preview,
  };
}

export function usePublishedCmsExperts() {
  return useCmsExpertsState().experts;
}

export function useCmsExpertsState() {
  const { data, status } = useCmsResource<ExpertDraft[]>(
    "experts",
    fetchPublishedCmsExperts,
  );
  return { experts: data ?? null, status };
}

export function usePublishedNav() {
  return useCmsNavState().nav;
}

export function useCmsNavState() {
  const { data, status } = useCmsResource<NavContent | null>(
    "nav",
    fetchPublishedNav,
  );
  return { nav: data ?? null, status };
}

export function usePublishedFooter() {
  return useCmsFooterState().footer;
}

export function useCmsFooterState() {
  const { data, status } = useCmsResource<FooterContent | null>(
    "footer",
    fetchPublishedFooter,
  );
  return { footer: data ?? null, status };
}

export function usePublishedPolicies() {
  return useCmsPoliciesState().policies;
}

export function useCmsPoliciesState() {
  const { data, status } = useCmsResource<
    Array<Pick<PolicyDocument, "slug" | "title" | "description" | "updated" | "badge">>
  >("policies", fetchPublishedPolicies);
  return { policies: data ?? null, status };
}
