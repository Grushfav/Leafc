import { Router } from "express";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { auditLogs, users } from "../db/schema.js";
import { writeAuditLog } from "../lib/audit.js";
import {
  createInviteToken,
  sendMemberInviteEmail,
} from "../lib/invites.js";
import {
  CONTENT_PERMISSION_KEYS,
  emptyPermissions,
  parsePermissionsPatch,
  resolveContentPermissions,
  syncLegacySiteContentEditor,
  type ContentPermissions,
} from "../lib/permissions.js";
import {
  isEffectiveSiteContentEditor,
  isStaffRole,
  requireAdmin,
  requireAuth,
  requireStaff,
  type AccountRole,
} from "../middleware/auth.js";

export const usersAdminRouter = Router();

usersAdminRouter.use(requireAuth, requireStaff, requireAdmin);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function inviteStatusOf(row: {
  passwordHash?: string | null;
  inviteTokenHash?: string | null;
}): "pending" | "active" {
  if (!row.passwordHash && row.inviteTokenHash) return "pending";
  return "active";
}

function serializeAdminUser(row: {
  id: number;
  name: string;
  email: string;
  role: string;
  siteContentEditor: boolean;
  canEditHome: boolean;
  canEditPages: boolean;
  canManageInsights: boolean;
  canManageAcademy: boolean;
  canViewNewsletter: boolean;
  canEditMenusFooter: boolean;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  passwordHash?: string | null;
  inviteTokenHash?: string | null;
  inviteExpiresAt?: Date | null;
}) {
  const permissions = resolveContentPermissions(row);
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as AccountRole,
    siteContentEditor: isEffectiveSiteContentEditor(
      row.role,
      row.siteContentEditor,
      permissions,
    ),
    siteContentEditorGranted: row.siteContentEditor,
    permissions,
    isActive: row.isActive,
    lastLoginAt: row.lastLoginAt,
    createdAt: row.createdAt,
    inviteStatus: inviteStatusOf(row),
    inviteExpiresAt: row.inviteExpiresAt ?? null,
  };
}

const adminUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  siteContentEditor: users.siteContentEditor,
  canEditHome: users.canEditHome,
  canEditPages: users.canEditPages,
  canManageInsights: users.canManageInsights,
  canManageAcademy: users.canManageAcademy,
  canViewNewsletter: users.canViewNewsletter,
  canEditMenusFooter: users.canEditMenusFooter,
  isActive: users.isActive,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
  passwordHash: users.passwordHash,
  inviteTokenHash: users.inviteTokenHash,
  inviteExpiresAt: users.inviteExpiresAt,
} as const;

usersAdminRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select(adminUserColumns)
      .from(users)
      .orderBy(asc(users.name));

    res.json({
      users: rows.map(serializeAdminUser),
    });
  } catch (error) {
    console.error("Failed to list users:", error);
    res.status(500).json({ error: "Unable to load users." });
  }
});

usersAdminRouter.get("/activity", async (req, res) => {
  const limitRaw = Number(req.query.limit ?? 100);
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.floor(limitRaw), 1), 250)
    : 100;
  const action =
    typeof req.query.action === "string" && req.query.action.trim()
      ? req.query.action.trim()
      : null;

  try {
    const rows = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        action: auditLogs.action,
        resourceType: auditLogs.resourceType,
        resourceId: auditLogs.resourceId,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        metadata: auditLogs.metadata,
        createdAt: auditLogs.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(action ? eq(auditLogs.action, action) : sql`true`)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    res.json({
      events: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        action: row.action,
        resourceType: row.resourceType,
        resourceId: row.resourceId,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        metadata: row.metadata ?? {},
        createdAt: row.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to load activity log:", error);
    res.status(500).json({ error: "Unable to load activity log." });
  }
});

usersAdminRouter.post("/invite", async (req, res) => {
  const name =
    typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const emailRaw =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const roleRaw =
    typeof req.body?.role === "string" ? req.body.role.trim() : "";

  if (!name) {
    res.status(400).json({ error: "Name is required." });
    return;
  }
  if (!emailRaw || !EMAIL_PATTERN.test(emailRaw)) {
    res.status(400).json({ error: "A valid email is required." });
    return;
  }
  if (!isStaffRole(roleRaw)) {
    res.status(400).json({
      error: "Role must be agent, senior_agent, or admin.",
    });
    return;
  }

  const email = emailRaw.toLowerCase();
  const role = roleRaw;

  try {
    const [existing] = await db
      .select(adminUserColumns)
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing?.passwordHash) {
      res.status(409).json({
        error: "An account with this email already exists.",
      });
      return;
    }

    const invite = createInviteToken();

    if (existing && !existing.passwordHash) {
      const [updated] = await db
        .update(users)
        .set({
          name,
          role,
          inviteTokenHash: invite.hash,
          inviteExpiresAt: invite.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, existing.id))
        .returning(adminUserColumns);

      try {
        await sendMemberInviteEmail({
          to: updated.email,
          name: updated.name,
          role: updated.role,
          token: invite.raw,
        });
      } catch (error) {
        console.error("Failed to resend member invite email:", error);
        res.status(500).json({
          error:
            "Invite was updated but the email could not be sent. Try resending shortly.",
        });
        return;
      }

      await writeAuditLog({
        userId: req.auth?.id,
        action: "user.invite.resend",
        resourceType: "user",
        resourceId: String(updated.id),
        req,
        metadata: { email: updated.email, role: updated.role },
      });

      res.json({ user: serializeAdminUser(updated) });
      return;
    }

    const perms = emptyPermissions();
    const [created] = await db
      .insert(users)
      .values({
        name,
        email,
        role,
        passwordHash: null,
        emailVerifiedAt: null,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        inviteTokenHash: invite.hash,
        inviteExpiresAt: invite.expiresAt,
        siteContentEditor: false,
        canEditHome: perms.canEditHome,
        canEditPages: perms.canEditPages,
        canManageInsights: perms.canManageInsights,
        canManageAcademy: perms.canManageAcademy,
        canViewNewsletter: perms.canViewNewsletter,
        canEditMenusFooter: perms.canEditMenusFooter,
      })
      .returning(adminUserColumns);

    try {
      await sendMemberInviteEmail({
        to: created.email,
        name: created.name,
        role: created.role,
        token: invite.raw,
      });
    } catch (error) {
      await db.delete(users).where(eq(users.id, created.id));
      console.error("Failed to send member invite email:", error);
      res.status(500).json({
        error:
          "Invite could not be created because the email could not be sent. Try again shortly.",
      });
      return;
    }

    await writeAuditLog({
      userId: req.auth?.id,
      action: "user.invite",
      resourceType: "user",
      resourceId: String(created.id),
      req,
      metadata: { email: created.email, role: created.role },
    });

    res.status(201).json({ user: serializeAdminUser(created) });
  } catch (error) {
    console.error("Failed to invite user:", error);
    res.status(500).json({ error: "Unable to invite user." });
  }
});

usersAdminRouter.post("/:id/resend-invite", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid user id." });
    return;
  }

  try {
    const [existing] = await db
      .select(adminUserColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (existing.passwordHash) {
      res.status(400).json({
        error: "This member already accepted their invite.",
      });
      return;
    }

    const invite = createInviteToken();
    const [updated] = await db
      .update(users)
      .set({
        inviteTokenHash: invite.hash,
        inviteExpiresAt: invite.expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning(adminUserColumns);

    try {
      await sendMemberInviteEmail({
        to: updated.email,
        name: updated.name,
        role: updated.role,
        token: invite.raw,
      });
    } catch (error) {
      console.error("Failed to resend member invite email:", error);
      res.status(500).json({
        error:
          "Invite token was refreshed but the email could not be sent. Try again shortly.",
      });
      return;
    }

    await writeAuditLog({
      userId: req.auth?.id,
      action: "user.invite.resend",
      resourceType: "user",
      resourceId: String(updated.id),
      req,
      metadata: { email: updated.email, role: updated.role },
    });

    res.json({ user: serializeAdminUser(updated) });
  } catch (error) {
    console.error("Failed to resend invite:", error);
    res.status(500).json({ error: "Unable to resend invite." });
  }
});

usersAdminRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid user id." });
    return;
  }

  try {
    const [existing] = await db
      .select(adminUserColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (inviteStatusOf(existing) !== "pending") {
      res.status(400).json({
        error: "Only pending invites can be cancelled.",
      });
      return;
    }

    await db.delete(users).where(eq(users.id, id));

    await writeAuditLog({
      userId: req.auth?.id,
      action: "user.invite.cancel",
      resourceType: "user",
      resourceId: String(id),
      req,
      metadata: { email: existing.email },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to cancel invite:", error);
    res.status(500).json({ error: "Unable to cancel invite." });
  }
});

usersAdminRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid user id." });
    return;
  }

  const hasPermissionsBody =
    req.body?.permissions && typeof req.body.permissions === "object";
  const hasLegacyToggle = typeof req.body?.siteContentEditor === "boolean";

  if (!hasPermissionsBody && !hasLegacyToggle) {
    res.status(400).json({
      error: "Provide permissions object or siteContentEditor boolean.",
    });
    return;
  }

  try {
    const [existing] = await db
      .select(adminUserColumns)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (existing.role === "admin") {
      res.status(400).json({
        error: "Admins always have full access; no grant change needed.",
      });
      return;
    }

    let nextPermissions: ContentPermissions = resolveContentPermissions(existing);

    if (hasPermissionsBody) {
      const parsed = parsePermissionsPatch(req.body.permissions);
      if (!parsed.ok) {
        res.status(400).json({ error: parsed.error });
        return;
      }
      nextPermissions = { ...nextPermissions, ...parsed.value };
    } else if (hasLegacyToggle) {
      nextPermissions = req.body.siteContentEditor
        ? {
            canEditHome: true,
            canEditPages: true,
            canManageInsights: true,
            canManageAcademy: true,
            canViewNewsletter: true,
            canEditMenusFooter: true,
          }
        : emptyPermissions();
    }

    const siteContentEditor = syncLegacySiteContentEditor(nextPermissions);

    const [updated] = await db
      .update(users)
      .set({
        siteContentEditor,
        canEditHome: nextPermissions.canEditHome,
        canEditPages: nextPermissions.canEditPages,
        canManageInsights: nextPermissions.canManageInsights,
        canManageAcademy: nextPermissions.canManageAcademy,
        canViewNewsletter: nextPermissions.canViewNewsletter,
        canEditMenusFooter: nextPermissions.canEditMenusFooter,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning(adminUserColumns);

    await writeAuditLog({
      userId: req.auth?.id,
      action: "permissions.update",
      resourceType: "user",
      resourceId: String(id),
      req,
      metadata: {
        targetEmail: updated.email,
        permissions: nextPermissions,
        changedKeys: CONTENT_PERMISSION_KEYS.filter(
          (key) =>
            resolveContentPermissions(existing)[key] !== nextPermissions[key],
        ),
      },
    });

    res.json({ user: serializeAdminUser(updated) });
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Unable to update user." });
  }
});
