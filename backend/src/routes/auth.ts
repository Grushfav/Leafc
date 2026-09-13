import { createHash, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";
import {
  createEmailVerificationToken,
  hashEmailVerificationToken,
  sendMemberVerificationEmail,
} from "../lib/verification.js";
import {
  isStaffRole,
  requireAuth,
  signToken,
  type AccountRole,
  type StaffRole,
} from "../middleware/auth.js";
import {
  avatarPublicUrl,
  discardUploadedFile,
  isAllowedImageFile,
  parseAvatarUpload,
  removeStoredAvatar,
} from "../lib/avatars.js";

export const authRouter = Router();

const CUSTOMER_KINDS = ["individual", "organization"] as const;
type CustomerKind = (typeof CUSTOMER_KINDS)[number];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

interface RegisterBody {
  accountType?: string;
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  inviteCode?: string;
  customerKind?: string;
  organizationName?: string;
}

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
  lastLoginAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    customerKind: user.customerKind,
    organizationName: user.organizationName,
    avatarUrl: user.avatarUrl,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

function inviteCodeMatches(provided: string, expected: string): boolean {
  const left = createHash("sha256").update(provided).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

authRouter.post("/register", async (req, res) => {
  const body = req.body as RegisterBody;
  const errors: Record<string, string> = {};

  if (!isNonEmptyString(body.accountType)) {
    errors.accountType = "Choose member or customer signup.";
  } else if (body.accountType !== "member" && body.accountType !== "customer") {
    errors.accountType = "Invalid account type.";
  }

  if (!isNonEmptyString(body.name)) {
    errors.name = "Full name is required.";
  }

  if (!isNonEmptyString(body.email)) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(body.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!isNonEmptyString(body.password)) {
    errors.password = "Password is required.";
  } else if (body.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }

  let role: AccountRole = "customer";
  let customerKind: CustomerKind | null = null;
  let organizationName: string | null = null;

  if (body.accountType === "member") {
    if (!isNonEmptyString(body.role) || !isStaffRole(body.role)) {
      errors.role = "Select admin, senior agent, or agent.";
    } else {
      role = body.role as StaffRole;
    }

    const expected = process.env.STAFF_INVITE_CODE ?? "";
    if (!expected) {
      errors.inviteCode =
        "Member signup is not configured. Contact a LEAF-C administrator.";
    } else if (!isNonEmptyString(body.inviteCode)) {
      errors.inviteCode = "Member invite code is required.";
    } else if (!inviteCodeMatches(body.inviteCode.trim(), expected)) {
      errors.inviteCode = "Invalid invite code.";
    }
  }

  if (body.accountType === "customer") {
    role = "customer";
    if (
      !isNonEmptyString(body.customerKind) ||
      !CUSTOMER_KINDS.includes(body.customerKind as CustomerKind)
    ) {
      errors.customerKind = "Select individual or organisation.";
    } else {
      customerKind = body.customerKind as CustomerKind;
    }

    if (customerKind === "organization") {
      if (!isNonEmptyString(body.organizationName)) {
        errors.organizationName = "Organisation name is required.";
      } else {
        organizationName = body.organizationName.trim();
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  const email = body.email!.trim().toLowerCase();

  try {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({
        error: "An account with this email already exists.",
        fields: { email: "This email is already registered." },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password!, 12);
    const memberVerification =
      body.accountType === "member" ? createEmailVerificationToken() : null;

    const [created] = await db
      .insert(users)
      .values({
        name: body.name!.trim(),
        email,
        role,
        customerKind,
        organizationName,
        passwordHash,
        emailVerifiedAt: memberVerification ? null : new Date(),
        emailVerificationToken: memberVerification?.hash ?? null,
        emailVerificationExpiresAt: memberVerification?.expiresAt ?? null,
      })
      .returning(publicUserColumns);

    if (memberVerification) {
      try {
        await sendMemberVerificationEmail({
          to: created.email,
          name: created.name,
          token: memberVerification.raw,
        });
      } catch (error) {
        await db.delete(users).where(eq(users.id, created.id));
        console.error("Failed to send member verification email:", error);
        res.status(503).json({
          error:
            "Account could not be created because the confirmation email could not be sent. Try again shortly.",
        });
        return;
      }

      res.status(201).json({
        requiresVerification: true,
        email: created.email,
      });
      return;
    }

    const token = signToken({
      id: created.id,
      email: created.email,
      role: created.role,
    });

    res.status(201).json({
      requiresVerification: false,
      token,
      user: publicUser(created),
    });
  } catch (error) {
    console.error("Failed to register user:", error);
    res.status(500).json({
      error: "Unable to create your account right now. Please try again.",
    });
  }
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

    if (!user?.passwordHash) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    const matches = await bcrypt.compare(body.password, user.passwordHash);
    if (!matches || !user.isActive) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }

    if (isStaffRole(user.role) && !user.emailVerifiedAt) {
      res.status(403).json({
        error:
          "Verify your email before signing in. Check your inbox for a confirmation link from LEAF-C.",
        code: "email_unverified",
      });
      return;
    }

    const [updated] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning(publicUserColumns);

    const token = signToken({
      id: updated.id,
      email: updated.email,
      role: updated.role,
    });

    res.json({ token, user: publicUser(updated) });
  } catch (error) {
    console.error("Failed to sign in:", error);
    res.status(500).json({ error: "Unable to sign in right now." });
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

authRouter.get("/me", requireAuth, async (req, res) => {
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

authRouter.patch("/me", requireAuth, async (req, res) => {
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

authRouter.post("/me/avatar", requireAuth, parseAvatarUpload, async (req, res) => {
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

    const avatarUrl = avatarPublicUrl(file.filename);
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
