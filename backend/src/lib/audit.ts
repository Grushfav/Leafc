import type { Request } from "express";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";

export async function writeAuditLog(input: {
  userId?: number | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  req?: Request;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditLogs).values({
      userId: input.userId ?? null,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      ipAddress: input.req
        ? String(input.req.headers["x-forwarded-for"] ?? input.req.ip ?? "")
            .split(",")[0]
            .trim() || null
        : null,
      userAgent: input.req ? String(input.req.headers["user-agent"] ?? "").slice(0, 500) || null : null,
      metadata: input.metadata ?? {},
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
