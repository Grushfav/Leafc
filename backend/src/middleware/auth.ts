import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

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
