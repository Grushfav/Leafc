import type { AuthError, ContentPermissions } from "@/lib/auth";
import type {
  CmsExpertRecord,
  CmsPageSlug,
  ExpertDraft,
  FooterContent,
  NavContent,
  PageContent,
  PoliciesContent,
  PolicyDocument,
  PublishedSiteNotice,
  SiteNoticeContent,
} from "@/lib/cms/types";

type CmsGlobalKey = "nav" | "footer" | "policies" | "notice";
type CmsGlobalContent =
  | NavContent
  | FooterContent
  | PoliciesContent
  | SiteNoticeContent;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | AuthError;
  if (!response.ok) {
    throw data as AuthError;
  }
  return data as T;
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export function resolveCmsAssetUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    if (url.startsWith("/uploads/")) {
      return `${API_URL}${url}`;
    }
    return url;
  }
  return url;
}

export async function fetchPublishedCmsPage(
  slug: CmsPageSlug,
): Promise<PageContent | null> {
  const response = await fetch(`${API_URL}/cms/pages/${slug}`);
  const data = await parseJson<{ page: { content: PageContent } | null }>(response);
  return data.page?.content ?? null;
}

export async function fetchPublishedCmsExperts(): Promise<ExpertDraft[]> {
  const response = await fetch(`${API_URL}/cms/experts`);
  const data = await parseJson<{ experts: (ExpertDraft & { id: number })[] }>(response);
  return data.experts;
}

export async function fetchPublishedNav(): Promise<NavContent | null> {
  const response = await fetch(`${API_URL}/cms/nav`);
  const data = await parseJson<{ nav: NavContent | null }>(response);
  return data.nav;
}

export async function fetchPublishedFooter(): Promise<FooterContent | null> {
  const response = await fetch(`${API_URL}/cms/footer`);
  const data = await parseJson<{ footer: FooterContent | null }>(response);
  return data.footer;
}

export async function fetchPublishedSiteNotice(): Promise<PublishedSiteNotice | null> {
  const response = await fetch(`${API_URL}/cms/notice`);
  const data = await parseJson<{ notice: PublishedSiteNotice | null }>(response);
  return data.notice;
}

export async function fetchAdminCmsPage(token: string, slug: CmsPageSlug) {
  const response = await fetch(`${API_URL}/admin/cms/pages/${slug}`, {
    headers: authHeaders(token),
  });
  return parseJson<{
    page: {
      slug: CmsPageSlug;
      draftContent: PageContent;
      publishedContent: PageContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function fetchCmsPagePreview(token: string, slug: CmsPageSlug) {
  const response = await fetch(`${API_URL}/admin/cms/pages/${slug}/preview`, {
    headers: authHeaders(token),
  });
  return parseJson<{ page: { slug: CmsPageSlug; content: PageContent } }>(response);
}

export async function saveCmsPageDraft(
  token: string,
  slug: CmsPageSlug,
  content: PageContent,
) {
  const response = await fetch(`${API_URL}/admin/cms/pages/${slug}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  return parseJson<{
    page: {
      slug: CmsPageSlug;
      draftContent: PageContent;
      publishedContent: PageContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function publishCmsPage(token: string, slug: CmsPageSlug) {
  const response = await fetch(`${API_URL}/admin/cms/pages/${slug}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseJson<{
    page: {
      slug: CmsPageSlug;
      draftContent: PageContent;
      publishedContent: PageContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function fetchAdminCmsExperts(token: string) {
  const response = await fetch(`${API_URL}/admin/cms/experts`, {
    headers: authHeaders(token),
  });
  return parseJson<{ experts: CmsExpertRecord[] }>(response);
}

export async function createCmsExpert(token: string, draft: ExpertDraft) {
  const response = await fetch(`${API_URL}/admin/cms/experts`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(draft),
  });
  return parseJson<{ expert: CmsExpertRecord }>(response);
}

export async function updateCmsExpert(
  token: string,
  id: number,
  draft: ExpertDraft,
) {
  const response = await fetch(`${API_URL}/admin/cms/experts/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(draft),
  });
  return parseJson<{ expert: CmsExpertRecord }>(response);
}

export async function deleteCmsExpert(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/cms/experts/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseJson<{ ok: boolean }>(response);
}

export async function reorderCmsExperts(token: string, order: number[]) {
  const response = await fetch(`${API_URL}/admin/cms/experts/reorder`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ order }),
  });
  return parseJson<{ experts: CmsExpertRecord[] }>(response);
}

export async function publishCmsExperts(token: string) {
  const response = await fetch(`${API_URL}/admin/cms/experts/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseJson<{ experts: (ExpertDraft & { id: number })[] }>(response);
}

export async function fetchPublishedPolicies(): Promise<
  Array<Pick<PolicyDocument, "slug" | "title" | "description" | "updated" | "badge">>
> {
  const response = await fetch(`${API_URL}/cms/policies`);
  const data = await parseJson<{
    policies: Array<Pick<PolicyDocument, "slug" | "title" | "description" | "updated" | "badge">>;
  }>(response);
  return data.policies;
}

export async function fetchPublishedPolicy(slug: string): Promise<PolicyDocument | null> {
  const response = await fetch(`${API_URL}/cms/policies/${encodeURIComponent(slug)}`);
  if (response.status === 404) return null;
  const data = await parseJson<{ policy: PolicyDocument }>(response);
  return data.policy;
}

export async function fetchAdminGlobal(token: string, key: CmsGlobalKey) {
  const response = await fetch(`${API_URL}/admin/cms/globals/${key}`, {
    headers: authHeaders(token),
  });
  return parseJson<{
    global: {
      key: string;
      draftContent: CmsGlobalContent;
      publishedContent: CmsGlobalContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function saveAdminGlobal(
  token: string,
  key: CmsGlobalKey,
  content: CmsGlobalContent,
) {
  const response = await fetch(`${API_URL}/admin/cms/globals/${key}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
  return parseJson<{
    global: {
      key: string;
      draftContent: CmsGlobalContent;
      publishedContent: CmsGlobalContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function publishAdminGlobal(token: string, key: CmsGlobalKey) {
  const response = await fetch(`${API_URL}/admin/cms/globals/${key}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseJson<{
    global: {
      key: string;
      draftContent: CmsGlobalContent;
      publishedContent: CmsGlobalContent | null;
      publishedAt: string | null;
      updatedAt: string;
    };
  }>(response);
}

export async function uploadCmsMedia(token: string, file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}/admin/cms/media`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  const data = await parseJson<{ url: string }>(response);
  return data.url;
}

export type AdminUserRecord = {
  id: number;
  name: string;
  email: string;
  role: string;
  siteContentEditor: boolean;
  siteContentEditorGranted: boolean;
  permissions: ContentPermissions;
  isActive: boolean;
  inviteStatus: "pending" | "active";
  inviteExpiresAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type ActivityEvent = {
  id: number;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export async function fetchAdminUsers(token: string) {
  const response = await fetch(`${API_URL}/admin/users`, {
    headers: authHeaders(token),
  });
  return parseJson<{ users: AdminUserRecord[] }>(response);
}

export async function updateUserPermissions(
  token: string,
  id: number,
  permissions: Partial<ContentPermissions>,
) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ permissions }),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function inviteAdminUser(
  token: string,
  payload: { name: string; email: string; role: string },
) {
  const response = await fetch(`${API_URL}/admin/users/invite`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function resendAdminInvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/users/${id}/resend-invite`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function cancelAdminInvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseJson<{ ok: true }>(response);
}

/** @deprecated Prefer updateUserPermissions */
export async function setUserSiteContentEditor(
  token: string,
  id: number,
  siteContentEditor: boolean,
) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ siteContentEditor }),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function fetchActivityLog(
  token: string,
  opts?: { limit?: number; action?: string },
) {
  const params = new URLSearchParams();
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.action) params.set("action", opts.action);
  const qs = params.toString();
  const response = await fetch(
    `${API_URL}/admin/users/activity${qs ? `?${qs}` : ""}`,
    { headers: authHeaders(token) },
  );
  return parseJson<{ events: ActivityEvent[] }>(response);
}
