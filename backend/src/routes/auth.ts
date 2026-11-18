import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { and, eq, isNull } from "drizzle-orm";
import { loginChallenges, users } from "../db/schema.js";
import { db } from "../db/index.js";
import {
  isChallengeId,
  isTwoFactorEnabled,
  resendLoginChallenge,
  startLoginChallenge,
  TWO_FACTOR_RESEND_COOLDOWN_MS,
  verifyLoginChallenge,
} from "../lib/two-factor.js";
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
  sendMemberVerificationEmail,
} from "../lib/verification.js";
import { writeAuditLog } from "../lib/audit.js";
import { hashInviteToken } from "../lib/invites.js";
import {
  resolveContentPermissions,
  type ContentPermissions,
} from "../lib/permissions.js";
import {
  isEffectiveSiteContentEditor,
  isStaffRole,
  requireAuth,
  requireStaff,
  signToken,
  type AccountRole,
} from "../middleware/auth.js";
import {
  discardUploadedFile,
  isAllowedImageFile,
  parseAvatarUpload,
  persistAvatarUpload,
  removeStoredAvatar,
} from "../lib/avatars.js";

export const authRouter = Router();

const CUSTOMER_KINDS = ["individual", "organization"] as const;
type CustomerKind = (typeof CUSTOMER_KINDS)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface LoginBody {
  email?: string;
  password?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const publicUserColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  customerKind: users.customerKind,
  organizationName: users.organizationName,
  avatarUrl: users.avatarUrl,
  siteContentEditor: users.siteContentEditor,
  canEditHome: users.canEditHome,
  canEditPages: users.canEditPages,
  canManageInsights: users.canManageInsights,
  canManageAcademy: users.canManageAcademy,
  canViewNewsletter: users.canViewNewsletter,
  canEditMenusFooter: users.canEditMenusFooter,
  lastLoginAt: users.lastLoginAt,
  createdAt: users.createdAt,
} as const;

function publicUser(user: {
  id: number;
  name: string;
  email: string;
  role: AccountRole;
  customerKind: CustomerKind | null;
  organizationName: string | null;
  avatarUrl: string | null;
  siteContentEditor: boolean;
  canEditHome: boolean;
  canEditPages: boolean;
  canManageInsights: boolean;
  canManageAcademy: boolean;
  canViewNewsletter: boolean;
  canEditMenusFooter: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}) {
  const permissions: ContentPermissions = resolveContentPermissions(user);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerKind: user.customerKind,
    organizationName: user.organizationName,
    avatarUrl: user.avatarUrl,
    siteContentEditor: isEffectiveSiteContentEditor(
      user.role,
      user.siteContentEditor,
      permissions,
    ),
    permissions,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

authRouter.post("/register", async (_req, res) => {
  res.status(403).json({
    error:
      "Staff accounts are created by admin invite only. Ask a LEAF-C administrator.",
    code: "invite_only",
  });
});

authRouter.post("/login", async (req, res) => {
  const body = req.body as LoginBody;

  if (!isNonEmptyString(body.email) || !isNonEmptyString(body.password)) {
    res.status(400).json({ error: "Email and password are required." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, body.email.trim().toLowerCase()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!user.passwordHash) {
      res.status(403).json({
        error:
          "This account is waiting for you to accept your invite email.",
        code: "invite_pending",
      });
      return;
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches || !user.isActive) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (!isStaffRole(user.role)) {
      res.status(403).json({
        error:
          "This portal is for LEAF-C staff. Request services from the Get Started form — a customer account is not required.",
        code: "staff_only",
      });
      return;
    }

    if (!user.emailVerifiedAt) {
      res.status(403).json({
        error:
          "Verify your email before signing in. Check your inbox for a confirmation link from LEAF-C.",
        code: "email_unverified",
      });
      return;
    }

    if (isTwoFactorEnabled()) {
      try {
        const challenge = await startLoginChallenge({
          id: user.id,
          email: user.email,
          name: user.name,
        });
        res.json({
          requiresTwoFactor: true,
          challengeId: challenge.challengeId,
          maskedEmail: challenge.maskedEmail,
          resendAfterSeconds: Math.round(TWO_FACTOR_RESEND_COOLDOWN_MS / 1000),
        });
      } catch (error) {
        console.error("Failed to send sign-in code:", error);
        res.status(502).json({
          error:
            "We could not email your sign-in code right now. Please try again in a moment.",
          code: "two_factor_email_failed",
        });
      }
      return;
    }

    await completeLogin(req, res, user.id);
  } catch (error) {
    console.error("Failed to sign in:", error);
    res.status(500).json({ error: "Unable to sign in right now." });
  }
});

async function completeLogin(req: Request, res: Response, userId: number) {
  const [updated] = await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning(publicUserColumns);

  await writeAuditLog({
    userId: updated.id,
    action: "login",
    resourceType: "user",
    resourceId: String(updated.id),
    req,
    metadata: { email: updated.email, role: updated.role },
  });

  const token = signToken({
    id: updated.id,
    email: updated.email,
    role: updated.role,
  });

  res.json({ token, user: publicUser(updated) });
}

authRouter.post("/login/verify", async (req, res) => {
  const body = req.body as { challengeId?: unknown; code?: unknown };
  const code = typeof body.code === "string" ? body.code.replace(/\s+/g, "") : "";

  if (!isChallengeId(body.challengeId) || !/^\d{6}$/.test(code)) {
    res.status(400).json({ error: "Enter the 6-digit code from your email." });
    return;
  }

  try {
    const result = await verifyLoginChallenge(body.challengeId, code);

    if (!result.ok) {
      switch (result.reason) {
        case "wrong_code":
          res.status(401).json({
            error: `That code is not correct. ${result.attemptsLeft} attempt${result.attemptsLeft === 1 ? "" : "s"} left.`,
            code: "wrong_code",
          });
          return;
        case "locked":
          res.status(429).json({
            error: "Too many incorrect codes. Sign in again to get a new code.",
            code: "two_factor_locked",
          });
          return;
        case "expired":
          res.status(401).json({
            error: "That code has expired. Sign in again to get a new code.",
            code: "two_factor_expired",
          });
          return;
        default:
          res.status(401).json({
            error: "This sign-in attempt is no longer valid. Sign in again.",
            code: "two_factor_invalid",
          });
          return;
      }
    }

    const [user] = await db
      .select({ id: users.id, role: users.role, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, result.userId))
      .limit(1);

    if (!user || !user.isActive || !isStaffRole(user.role)) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    await completeLogin(req, res, user.id);
  } catch (error) {
    console.error("Failed to verify sign-in code:", error);
    res.status(500).json({ error: "Unable to sign in right now." });
  }
});

authRouter.post("/login/resend", async (req, res) => {
  const body = req.body as { challengeId?: unknown };

  if (!isChallengeId(body.challengeId)) {
    res.status(400).json({ error: "Sign in again to get a new code." });
    return;
  }

  try {
    const [challenge] = await db
      .select({ userId: loginChallenges.userId })
      .from(loginChallenges)
      .where(eq(loginChallenges.id, body.challengeId))
      .limit(1);

    if (!challenge) {
      res.status(401).json({
        error: "This sign-in attempt is no longer valid. Sign in again.",
        code: "two_factor_invalid",
      });
      return;
    }

    const [user] = await db
      .select({ email: users.email, name: users.name, isActive: users.isActive })
      .from(users)
      .where(eq(users.id, challenge.userId))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({
        error: "This sign-in attempt is no longer valid. Sign in again.",
        code: "two_factor_invalid",
      });
      return;
    }

    const result = await resendLoginChallenge(body.challengeId, user);

    if (!result.ok) {
      switch (result.reason) {
        case "cooldown":
          res.status(429).json({
            error: `Please wait ${result.retryAfterSeconds} seconds before requesting another code.`,
            code: "two_factor_cooldown",
            retryAfterSeconds: result.retryAfterSeconds,
          });
          return;
        case "limit":
          res.status(429).json({
            error: "Too many codes requested. Sign in again to start over.",
            code: "two_factor_resend_limit",
          });
          return;
        case "expired":
          res.status(401).json({
            error: "That sign-in attempt has expired. Sign in again.",
            code: "two_factor_expired",
          });
          return;
        default:
          res.status(401).json({
            error: "This sign-in attempt is no longer valid. Sign in again.",
            code: "two_factor_invalid",
          });
          return;
      }
    }

    res.json({
      message: `We sent a new code to ${result.maskedEmail}.`,
      maskedEmail: result.maskedEmail,
      resendAfterSeconds: Math.round(TWO_FACTOR_RESEND_COOLDOWN_MS / 1000),
    });
  } catch (error) {
    console.error("Failed to resend sign-in code:", error);
    res.status(502).json({
      error: "We could not email a new code right now. Please try again shortly.",
      code: "two_factor_email_failed",
    });
  }
});

authRouter.get("/invite/:token", async (req, res) => {
  const raw = String(req.params.token ?? "").trim();
  if (!raw) {
    res.status(400).json({ error: "Invite token is required." });
    return;
  }
  const hash = hashInviteToken(raw);
  try {
    const [row] = await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        inviteExpiresAt: users.inviteExpiresAt,
        inviteTokenHash: users.inviteTokenHash,
      })
      .from(users)
      .where(eq(users.inviteTokenHash, hash))
      .limit(1);

    if (!row || row.passwordHash) {
      res.status(400).json({
        error: "This invite link is invalid or has already been used.",
      });
      return;
    }
    if (!row.isActive) {
      res.status(403).json({
        error: "This invite is no longer available.",
      });
      return;
    }
    if (!row.inviteExpiresAt || row.inviteExpiresAt.getTime() < Date.now()) {
      res.status(410).json({
        error: "This invite link has expired. Ask an admin to resend it.",
      });
      return;
    }

    res.json({
      name: row.name,
      email: row.email,
      role: row.role,
      expiresAt: row.inviteExpiresAt,
    });
  } catch (error) {
    console.error("Failed to load invite:", error);
    res.status(500).json({ error: "Unable to load invite." });
  }
});

authRouter.post("/accept-invite", async (req, res) => {
  const raw =
    typeof req.body?.token === "string" ? req.body.token.trim() : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!raw) {
    res.status(400).json({ error: "Invite token is required." });
    return;
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
    return;
  }

  const hash = hashInviteToken(raw);
  try {
    const [row] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        inviteExpiresAt: users.inviteExpiresAt,
      })
      .from(users)
      .where(eq(users.inviteTokenHash, hash))
      .limit(1);

    if (!row || row.passwordHash) {
      res.status(400).json({
        error: "This invite link is invalid or has already been used.",
      });
      return;
    }
    if (!row.isActive) {
      res.status(403).json({
        error: "This invite is no longer available.",
      });
      return;
    }
    if (!row.inviteExpiresAt || row.inviteExpiresAt.getTime() < Date.now()) {
      res.status(410).json({
        error: "This invite link has expired. Ask an admin to resend it.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [updated] = await db
      .update(users)
      .set({
        passwordHash,
        emailVerifiedAt: new Date(),
        inviteTokenHash: null,
        inviteExpiresAt: null,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(users.id, row.id),
          isNull(users.passwordHash),
          eq(users.inviteTokenHash, hash),
        ),
      )
      .returning(publicUserColumns);

    if (!updated) {
      res.status(400).json({
        error: "This invite link is invalid or has already been used.",
      });
      return;
    }

    await writeAuditLog({
      userId: updated.id,
      action: "user.invite.accept",
      resourceType: "user",
      resourceId: String(updated.id),
      req,
      metadata: { email: updated.email, role: updated.role },
    });

    const token = signToken({
      id: updated.id,
      email: updated.email,
      role: updated.role,
    });

    res.json({ token, user: publicUser(updated) });
  } catch (error) {
    console.error("Failed to accept invite:", error);
    res.status(500).json({ error: "Unable to accept invite." });
  }
});

authRouter.post("/verify-email", async (req, res) => {
  const raw =
    typeof req.body?.token === "string" ? req.body.token.trim() : "";

  if (!raw) {
    res.status(400).json({ error: "Verification link is missing or invalid." });
    return;
  }

  try {
    const hash = hashEmailVerificationToken(raw);
    const [user] = await db
      .select({
        id: users.id,
        emailVerifiedAt: users.emailVerifiedAt,
        emailVerificationExpiresAt: users.emailVerificationExpiresAt,
      })
      .from(users)
      .where(eq(users.emailVerificationToken, hash))
      .limit(1);

    if (!user) {
      res.status(400).json({ error: "This verification link is invalid or has already been used." });
      return;
    }

    if (
      !user.emailVerificationExpiresAt ||
      user.emailVerificationExpiresAt.getTime() < Date.now()
    ) {
      res.status(400).json({
        error: "This verification link has expired. Sign up again or request a new link from sign in.",
      });
      return;
    }

    await db
      .update(users)
      .set({
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    res.json({ message: "Email verified. You can now sign in." });
  } catch (error) {
    console.error("Failed to verify email:", error);
    res.status(500).json({ error: "Unable to verify your email right now." });
  }
});

authRouter.post("/resend-verification", async (req, res) => {
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (
      user &&
      user.isActive &&
      user.passwordHash &&
      isStaffRole(user.role) &&
      !user.emailVerifiedAt
    ) {
      const next = createEmailVerificationToken();
      await db
        .update(users)
        .set({
          emailVerificationToken: next.hash,
          emailVerificationExpiresAt: next.expiresAt,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      await sendMemberVerificationEmail({
        to: user.email,
        name: user.name,
        token: next.raw,
      });
    }

    res.json({
      message:
        "If that email has a pending member account, we sent a new confirmation link.",
    });
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    res.status(500).json({ error: "Unable to send a confirmation email right now." });
  }
});

authRouter.get("/me", requireAuth, requireStaff, async (req, res) => {
  try {
    const [user] = await db
      .select({
        ...publicUserColumns,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, req.auth!.id))
      .limit(1);

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Account not found." });
      return;
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Failed to load profile:", error);
    res.status(500).json({ error: "Unable to load your profile." });
  }
});

interface ProfileBody {
  name?: string;
  organizationName?: string;
  currentPassword?: string;
  newPassword?: string;
}

authRouter.patch("/me", requireAuth, requireStaff, async (req, res) => {
  const body = req.body as ProfileBody;
  const errors: Record<string, string> = {};

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.name = "Full name is required.";
  }

  if (
    body.organizationName !== undefined &&
    body.organizationName !== "" &&
    typeof body.organizationName !== "string"
  ) {
    errors.organizationName = "Invalid organisation name.";
  }

  const changingPassword = isNonEmptyString(body.newPassword);
  if (changingPassword) {
    if (body.newPassword!.length < MIN_PASSWORD_LENGTH) {
      errors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!isNonEmptyString(body.currentPassword)) {
      errors.currentPassword = "Current password is required to set a new one.";
    }
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.auth!.id))
      .limit(1);

    if (!existing || !existing.isActive) {
      res.status(401).json({ error: "Account not found." });
      return;
    }

    if (changingPassword) {
      if (!existing.passwordHash) {
        res.status(400).json({
          error: "Password cannot be updated for this account.",
          fields: { currentPassword: "No password is set on this account." },
        });
        return;
      }
      const matches = await bcrypt.compare(
        body.currentPassword!,
        existing.passwordHash,
      );
      if (!matches) {
        res.status(400).json({
          error: "Validation failed",
          fields: { currentPassword: "Current password is incorrect." },
        });
        return;
      }
    }

    const patch: {
      name?: string;
      organizationName?: string | null;
      passwordHash?: string;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (isNonEmptyString(body.name)) {
      patch.name = body.name.trim();
    }

    if (body.organizationName !== undefined) {
      patch.organizationName = isNonEmptyString(body.organizationName)
        ? body.organizationName.trim()
        : null;
    }

    if (changingPassword) {
      patch.passwordHash = await bcrypt.hash(body.newPassword!, 12);
    }

    const [updated] = await db
      .update(users)
      .set(patch)
      .where(eq(users.id, existing.id))
      .returning(publicUserColumns);

    res.json({ user: publicUser(updated) });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ error: "Unable to update your profile." });
  }
});

authRouter.post("/me/avatar", requireAuth, requireStaff, parseAvatarUpload, async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Choose an image to upload." });
    return;
  }

  try {
    const allowed = await isAllowedImageFile(file.path, file.mimetype);
    if (!allowed) {
      await discardUploadedFile(file.path);
      res.status(400).json({ error: "Use a JPEG, PNG, or WebP image." });
      return;
    }

    const [existing] = await db
      .select({
        id: users.id,
        isActive: users.isActive,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, req.auth!.id))
      .limit(1);

    if (!existing || !existing.isActive) {
      await discardUploadedFile(file.path);
      res.status(401).json({ error: "Account not found." });
      return;
    }

    const stored = await persistAvatarUpload(file);
    const avatarUrl = stored.url;
    const [updated] = await db
      .update(users)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, existing.id))
      .returning(publicUserColumns);

    if (existing.avatarUrl && existing.avatarUrl !== avatarUrl) {
      removeStoredAvatar(existing.avatarUrl);
    }

    res.json({ user: publicUser(updated) });
  } catch (error) {
    await discardUploadedFile(file.path);
    console.error("Failed to save avatar:", error);
    res.status(500).json({ error: "Unable to save your profile picture." });
  }
});
