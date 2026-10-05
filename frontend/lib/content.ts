import type { AuthError } from "@/lib/auth";
import type { AcademyCourse } from "@/lib/academy";
import type { InsightArticle } from "@/lib/insights";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface AdminInsight {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  body: string;
  takeaways: string[];
  relatedHref: string | null;
  relatedLabel: string | null;
  readMinutes: number;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InsightPayload {
  slug?: string;
  title: string;
  description: string;
  category: string;
  body: string;
  takeaways: string;
  relatedHref?: string;
  relatedLabel?: string;
  published: boolean;
}

export interface AcademyCoursePayload {
  code: string;
  title: string;
  description?: string;
  format: string;
  duration: string;
  dates: string;
  level: string;
  published: boolean;
  sortOrder?: number;
}

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

export async function fetchPublishedInsights(): Promise<InsightArticle[]> {
  const response = await fetch(`${API_URL}/insights`);
  const data = await parseJson<{ insights: InsightArticle[] }>(response);
  return data.insights;
}

export async function fetchPublishedInsight(
  slug: string,
): Promise<InsightArticle> {
  const response = await fetch(`${API_URL}/insights/${encodeURIComponent(slug)}`);
  const data = await parseJson<{ insight: InsightArticle }>(response);
  return data.insight;
}

export async function fetchAdminInsights(token: string): Promise<AdminInsight[]> {
  const response = await fetch(`${API_URL}/admin/insights`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ insights: AdminInsight[] }>(response);
  return data.insights;
}

export async function createInsight(
  token: string,
  payload: InsightPayload,
): Promise<AdminInsight> {
  const response = await fetch(`${API_URL}/admin/insights`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ insight: AdminInsight }>(response);
  return data.insight;
}

export async function updateInsight(
  token: string,
  id: number,
  payload: Partial<InsightPayload>,
): Promise<AdminInsight> {
  const response = await fetch(`${API_URL}/admin/insights/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ insight: AdminInsight }>(response);
  return data.insight;
}

export async function deleteInsight(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/admin/insights/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseJson<{ ok: boolean }>(response);
}

export async function fetchPublishedAcademyCourses(): Promise<AcademyCourse[]> {
  const response = await fetch(`${API_URL}/academy/courses`);
  const data = await parseJson<{ courses: AcademyCourse[] }>(response);
  return data.courses;
}

export async function fetchAdminAcademyCourses(
  token: string,
): Promise<AcademyCourse[]> {
  const response = await fetch(`${API_URL}/admin/academy/courses`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ courses: AcademyCourse[] }>(response);
  return data.courses;
}

export async function createAcademyCourse(
  token: string,
  payload: AcademyCoursePayload,
): Promise<AcademyCourse> {
  const response = await fetch(`${API_URL}/admin/academy/courses`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ course: AcademyCourse }>(response);
  return data.course;
}

export async function updateAcademyCourse(
  token: string,
  id: number,
  payload: Partial<AcademyCoursePayload>,
): Promise<AcademyCourse> {
  const response = await fetch(`${API_URL}/admin/academy/courses/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ course: AcademyCourse }>(response);
  return data.course;
}

export async function deleteAcademyCourse(
  token: string,
  id: number,
): Promise<void> {
  const response = await fetch(`${API_URL}/admin/academy/courses/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseJson<{ ok: boolean }>(response);
}

export function insightHref(slug: string, fromApi = false): string {
  return fromApi
    ? `/insights/article?slug=${encodeURIComponent(slug)}`
    : `/insights/${slug}`;
}

export function mergeInsights(
  staticArticles: InsightArticle[],
  remoteArticles: InsightArticle[],
): InsightArticle[] {
  const bySlug = new Map(staticArticles.map((article) => [article.slug, article]));
  for (const article of remoteArticles) {
    bySlug.set(article.slug, article);
  }
  return [...bySlug.values()].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
}
