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

export function fullPermissions(): ContentPermissions {
  return {
    canEditHome: true,
    canEditPages: true,
    canManageInsights: true,
    canManageAcademy: true,
    canViewNewsletter: true,
    canEditMenusFooter: true,
  };
}

export function resolveContentPermissions(input: {
  role: string;
  siteContentEditor?: boolean | null;
  canEditHome?: boolean | null;
  canEditPages?: boolean | null;
  canManageInsights?: boolean | null;
  canManageAcademy?: boolean | null;
  canViewNewsletter?: boolean | null;
  canEditMenusFooter?: boolean | null;
}): ContentPermissions {
  if (input.role === "admin") return fullPermissions();

  const legacy = input.siteContentEditor === true;
  const granular = {
    canEditHome: Boolean(input.canEditHome),
    canEditPages: Boolean(input.canEditPages),
    canManageInsights: Boolean(input.canManageInsights),
    canManageAcademy: Boolean(input.canManageAcademy),
    canViewNewsletter: Boolean(input.canViewNewsletter),
    canEditMenusFooter: Boolean(input.canEditMenusFooter),
  };

  const anyGranular = CONTENT_PERMISSION_KEYS.some((key) => granular[key]);
  if (!anyGranular && legacy) {
    // Pre-migration users: old site_content_editor meant full CMS access.
    // Insights/Academy were later opened to all staff; keep that for legacy editors.
    return fullPermissions();
  }

  return granular;
}

export function hasContentPermission(
  permissions: ContentPermissions,
  key: ContentPermissionKey,
): boolean {
  return permissions[key] === true;
}

export function hasAnyCmsPagePermission(permissions: ContentPermissions): boolean {
  return (
    permissions.canEditHome ||
    permissions.canEditPages ||
    permissions.canEditMenusFooter
  );
}

export function syncLegacySiteContentEditor(permissions: ContentPermissions): boolean {
  return (
    permissions.canEditHome ||
    permissions.canEditPages ||
    permissions.canEditMenusFooter ||
    permissions.canViewNewsletter
  );
}

export function parsePermissionsPatch(body: unknown): {
  ok: true;
  value: Partial<ContentPermissions>;
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid permissions payload." };
  }
  const raw = body as Record<string, unknown>;
  const value: Partial<ContentPermissions> = {};
  let saw = false;
  for (const key of CONTENT_PERMISSION_KEYS) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] !== "boolean") {
      return { ok: false, error: `${key} must be a boolean.` };
    }
    value[key] = raw[key] as boolean;
    saw = true;
  }
  if (!saw) {
    return { ok: false, error: "Provide at least one permission flag." };
  }
  return { ok: true, value };
}
