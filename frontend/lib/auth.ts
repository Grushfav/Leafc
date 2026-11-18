const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const TOKEN_KEY = "leafc_token";

export const STAFF_ROLES = ["admin", "senior_agent", "agent"] as const;
export const ACCOUNT_ROLES = [...STAFF_ROLES, "customer"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];
export type AccountRole = (typeof ACCOUNT_ROLES)[number];
export type CustomerKind = "individual" | "organization";
export type AccountType = "member" | "customer";

export const CONTENT_PERMISSION_KEYS = [
  "canEditHome",
  "canEditPages",
  "canManageInsights",
  "canManageAcademy",
  "canViewNewsletter",
  "canEditMenusFooter",
] as const;

export type ContentPermissionKey = (typeof CONTENT_PERMISSION_KEYS)[number];

export type ContentPermissions = Record<ContentPermissionKey, boolean>;

export const CONTENT_PERMISSION_LABELS: Record<ContentPermissionKey, string> = {
  canEditHome: "Edit home page",
  canEditPages: "Edit other pages",
  canManageInsights: "Add / edit insights",
  canManageAcademy: "Add / edit academy courses",
  canViewNewsletter: "View newsletter sign-ups",
  canEditMenusFooter: "Edit menus & footer",
};

export function emptyPermissions(): ContentPermissions {
  return {
    canEditHome: false,
    canEditPages: false,
    canManageInsights: false,
    canManageAcademy: false,
    canViewNewsletter: false,
    canEditMenusFooter: false,
  };
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AccountRole;
  customerKind: CustomerKind | null;
  organizationName: string | null;
  avatarUrl: string | null;
  siteContentEditor?: boolean;
  permissions?: ContentPermissions;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface TwoFactorChallenge {
  requiresTwoFactor: true;
  challengeId: string;
  maskedEmail: string;
  resendAfterSeconds: number;
}

export type LoginResult = AuthResponse | TwoFactorChallenge;

export function isTwoFactorChallenge(
  result: LoginResult,
): result is TwoFactorChallenge {
  return "requiresTwoFactor" in result && result.requiresTwoFactor === true;
}

export interface RegisterResult {
  requiresVerification: boolean;
  email?: string;
  token?: string;
  user?: AuthUser;
}

export interface AuthError {
  error: string;
  code?: string;
  fields?: Record<string, string>;
}

export interface ProfileUpdatePayload {
  name?: string;
  organizationName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface RegisterPayload {
  accountType: AccountType;
  name: string;
  email: string;
  password: string;
  role?: StaffRole;
  inviteCode?: string;
  customerKind?: CustomerKind;
  organizationName?: string;
}

export interface InquiryRecord {
  id: number;
  referenceNumber: string;
  fullName: string;
  email: string;
  phone: string | null;
  organization: string | null;
  clientType: string;
  serviceInterest: string;
  status: string;
  createdAt: string;
}

export interface DashboardSummary {
  kind: "staff" | "customer";
  inquiries: number;
  openCases?: number;
  newInquiries?: number;
  members?: number;
  trainingSessions?: number;
}

export function isStaffRole(role: AccountRole): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function isAdminRole(role: AccountRole): boolean {
  return role === "admin";
}

function permissionsOf(user: AuthUser): ContentPermissions {
  if (user.permissions) return user.permissions;
  if (isAdminRole(user.role)) {
    return {
      canEditHome: true,
      canEditPages: true,
      canManageInsights: true,
      canManageAcademy: true,
      canViewNewsletter: true,
      canEditMenusFooter: true,
    };
  }
  if (user.siteContentEditor) {
    return {
      canEditHome: true,
      canEditPages: true,
      canManageInsights: true,
      canManageAcademy: true,
      canViewNewsletter: true,
      canEditMenusFooter: true,
    };
  }
  return emptyPermissions();
}

export function hasPermission(
  user: AuthUser | null | undefined,
  key: ContentPermissionKey,
): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  return permissionsOf(user)[key] === true;
}

export function canEditSiteContent(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (isAdminRole(user.role)) return true;
  const perms = permissionsOf(user);
  return (
    perms.canEditHome ||
    perms.canEditPages ||
    perms.canEditMenusFooter ||
    user.siteContentEditor === true
  );
}

export function canAccessSitePages(user: AuthUser | null | undefined): boolean {
  return hasPermission(user, "canEditHome") || hasPermission(user, "canEditPages");
}

export function canAccessMenusFooter(user: AuthUser | null | undefined): boolean {
  return hasPermission(user, "canEditMenusFooter");
}

export function roleLabel(role: AccountRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "senior_agent":
      return "Senior agent";
    case "agent":
      return "Agent";
    case "customer":
      return "Customer";
  }
}

export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
): string | null {
  if (!avatarUrl) return null;
  if (/^https?:\/\//i.test(avatarUrl)) return avatarUrl;
  const base = API_URL.replace(/\/$/, "");
  return avatarUrl.startsWith("/") ? `${base}${avatarUrl}` : `${base}/${avatarUrl}`;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
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

export async function registerAccount(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return parseJson<RegisterResult>(response);
}

export async function verifyEmail(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ token }),
  });
  return parseJson<{ message: string }>(response);
}

export async function resendVerification(
  email: string,
): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  });
  return parseJson<{ message: string }>(response);
}

export async function loginAccount(
  email: string,
  password: string,
): Promise<LoginResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return parseJson<LoginResult>(response);
}

export async function verifyLoginCode(
  challengeId: string,
  code: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login/verify`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ challengeId, code }),
  });
  return parseJson<AuthResponse>(response);
}

export async function resendLoginCode(challengeId: string): Promise<{
  message: string;
  maskedEmail: string;
  resendAfterSeconds: number;
}> {
  const response = await fetch(`${API_URL}/auth/login/resend`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ challengeId }),
  });
  return parseJson<{
    message: string;
    maskedEmail: string;
    resendAfterSeconds: number;
  }>(response);
}

export async function updateProfile(
  token: string,
  payload: ProfileUpdatePayload,
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ user: AuthUser }>(response);
  return data.user;
}

export async function uploadAvatar(
  token: string,
  file: File,
): Promise<AuthUser> {
  const body = new FormData();
  body.append("avatar", file);
  const response = await fetch(`${API_URL}/auth/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  const data = await parseJson<{ user: AuthUser }>(response);
  return data.user;
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ user: AuthUser }>(response);
  return data.user;
}

export async function fetchDashboardSummary(
  token: string,
): Promise<DashboardSummary> {
  const response = await fetch(`${API_URL}/dashboard/summary`, {
    headers: authHeaders(token),
  });
  return parseJson<DashboardSummary>(response);
}

export async function fetchInquiries(
  token: string,
): Promise<InquiryRecord[]> {
  const response = await fetch(`${API_URL}/inquiries`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ inquiries: InquiryRecord[] }>(response);
  return data.inquiries;
}

export async function fetchInvite(rawToken: string) {
  const response = await fetch(
    `${API_URL}/auth/invite/${encodeURIComponent(rawToken)}`,
  );
  return parseJson<{
    name: string;
    email: string;
    role: AccountRole;
    expiresAt: string;
  }>(response);
}

export async function acceptInvite(
  rawToken: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/accept-invite`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ token: rawToken, password }),
  });
  return parseJson<AuthResponse>(response);
}
