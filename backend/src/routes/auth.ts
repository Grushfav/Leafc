import { createHash, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../db/schema.js";
import { db } from "../db/index.js";
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
    const [created] = await db
      .insert(users)
      .values({
        name: body.name!.trim(),
        email,
        role,
        customerKind,
        organizationName,
        passwordHash,
      })
      .returning(publicUserColumns);

    const token = signToken({
      id: created.id,
      email: created.email,
      role: created.role,
    });

    res.status(201).json({
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
