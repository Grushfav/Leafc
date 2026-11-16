import type { Request, Response, NextFunction } from "express";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import {
  hasContentPermission,
  resolveContentPermissions,
  type ContentPermissionKey,
  type ContentPermissions,
} from "../lib/permissions.js";

export const STAFF_ROLES = ["admin", "senior_agent", "agent"] as const;
export const ACCOUNT_ROLES = [...STAFF_ROLES, "customer"] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];
export type StaffRole = (typeof STAFF_ROLES)[number];

export interface AuthUser {
  id: number;
  email: string;
  role: AccountRole;
}

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as {
      sub: string;
      email: string;
      role: AccountRole;
    };
    req.auth = {
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.auth || !isStaffRole(req.auth.role)) {
    res.status(403).json({ error: "Staff access required." });
    return;
  }
  next();
}

export function isAdminRole(role: string): boolean {
  return role === "admin";
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.auth || !isAdminRole(req.auth.role)) {
    res.status(403).json({ error: "Admin access required." });
    return;
  }
  next();
}

export function isEffectiveSiteContentEditor(
  role: string,
  siteContentEditor: boolean | null | undefined,
  permissions?: ContentPermissions,
): boolean {
  if (isAdminRole(role)) return true;
  if (permissions) {
    return (
      permissions.canEditHome ||
      permissions.canEditPages ||
      permissions.canEditMenusFooter
    );
  }
  return siteContentEditor === true;
}

export async function loadUserPermissions(
  userId: number,
): Promise<{ active: boolean; permissions: ContentPermissions; role: string } | null> {
  const [row] = await db
    .select({
      role: users.role,
      isActive: users.isActive,
      siteContentEditor: users.siteContentEditor,
      canEditHome: users.canEditHome,
      canEditPages: users.canEditPages,
      canManageInsights: users.canManageInsights,
      canManageAcademy: users.canManageAcademy,
      canViewNewsletter: users.canViewNewsletter,
      canEditMenusFooter: users.canEditMenusFooter,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!row) return null;
  return {
    active: row.isActive,
    role: row.role,
    permissions: resolveContentPermissions(row),
  };
}

export async function requireSiteContentEditor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.auth) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  if (isAdminRole(req.auth.role)) {
    next();
    return;
  }
  try {
    const loaded = await loadUserPermissions(req.auth.id);
    if (!loaded?.active || !isEffectiveSiteContentEditor(loaded.role, false, loaded.permissions)) {
      res.status(403).json({ error: "Site content editor access required." });
      return;
    }
    next();
  } catch (error) {
    console.error("Failed to verify site content editor:", error);
    res.status(500).json({ error: "Unable to verify permissions." });
  }
}

export function requirePermission(key: ContentPermissionKey) {
  return requireAnyPermission(key);
}

export function requireAnyPermission(...keys: ContentPermissionKey[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      res.status(401).json({ error: "Sign in required." });
      return;
    }
    if (isAdminRole(req.auth.role)) {
      next();
      return;
    }
    try {
      const loaded = await loadUserPermissions(req.auth.id);
      if (
        !loaded?.active ||
        !keys.some((key) => hasContentPermission(loaded.permissions, key))
      ) {
        res.status(403).json({ error: "You do not have permission for this action." });
        return;
      }
      next();
    } catch (error) {
      console.error("Failed to verify permission:", error);
      res.status(500).json({ error: "Unable to verify permissions." });
    }
  };
}

export function permissionForCmsPageSlug(slug: string): ContentPermissionKey {
  return slug === "home" ? "canEditHome" : "canEditPages";
}

export function permissionForCmsGlobalKey(
  key: string,
): ContentPermissionKey {
  if (key === "nav" || key === "footer") return "canEditMenusFooter";
  return "canEditPages";
}

/** Returns false and sends 403 when the user lacks the permission. */
export async function assertContentPermission(
  req: Request,
  res: Response,
  key: ContentPermissionKey | ContentPermissionKey[],
): Promise<boolean> {
  if (!req.auth) {
    res.status(401).json({ error: "Sign in required." });
    return false;
  }
  if (isAdminRole(req.auth.role)) return true;
  const keys = Array.isArray(key) ? key : [key];
  try {
    const loaded = await loadUserPermissions(req.auth.id);
    if (
      !loaded?.active ||
      !keys.some((item) => hasContentPermission(loaded.permissions, item))
    ) {
      res.status(403).json({ error: "You do not have permission for this action." });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Failed to verify permission:", error);
    res.status(500).json({ error: "Unable to verify permissions." });
    return false;
  }
}
