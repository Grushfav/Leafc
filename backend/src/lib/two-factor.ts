import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db/index.js";
import { loginChallenges } from "../db/schema.js";
import { emailParagraph, escapeHtml, renderEmail } from "./email-template.js";
import { sendMail } from "./mailer.js";

export const TWO_FACTOR_CODE_LENGTH = 6;
export const TWO_FACTOR_TTL_MS = 10 * 60 * 1000;
export const TWO_FACTOR_MAX_ATTEMPTS = 5;
export const TWO_FACTOR_RESEND_COOLDOWN_MS = 30 * 1000;
export const TWO_FACTOR_MAX_RESENDS = 3;

/** Kill switch: set TWO_FACTOR_ENABLED=false to fall back to password-only login. */
export function isTwoFactorEnabled(): boolean {
  const value = process.env.TWO_FACTOR_ENABLED?.trim().toLowerCase();
  return value !== "false" && value !== "0" && value !== "off";
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
}

function generateCode(): string {
  return String(randomInt(0, 10 ** TWO_FACTOR_CODE_LENGTH)).padStart(
    TWO_FACTOR_CODE_LENGTH,
    "0",
  );
}

function hashCode(challengeId: string, code: string): string {
  return createHmac("sha256", getSecret())
    .update(`${challengeId}:${code}`)
    .digest("hex");
}

function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 1))}@${domain}`;
}

export async function sendTwoFactorEmail(options: {
  to: string;
  name: string;
  code: string;
}): Promise<void> {
  const firstName = options.name.trim().split(/\s+/)[0] || "there";
  const minutes = Math.round(TWO_FACTOR_TTL_MS / 60000);

  const sent = await sendMail({
    to: options.to,
    subject: `Your LEAF-C sign-in code: ${options.code}`,
    text: [
      `Hello ${firstName},`,
      "",
      `Your LEAF-C sign-in code is: ${options.code}`,
      "",
      `It expires in ${minutes} minutes and can only be used once.`,
      "If you did not try to sign in, ignore this email and consider changing your password.",
      "",
      "LEAF-C",
    ].join("\n"),
    html: renderEmail({
      preheader: `Your LEAF-C sign-in code is ${options.code}. It expires in ${minutes} minutes.`,
      heading: "Your sign-in code",
      bodyHtml: [
        emailParagraph(`Hello ${escapeHtml(firstName)},`),
        emailParagraph(
          `Your LEAF-C sign-in code is below. It expires in ${minutes} minutes and can only be used once.`,
        ),
      ].join(""),
      codeBlock: options.code,
      footerNote:
        "If you did not try to sign in, ignore this email and consider changing your password.",
    }),
  });

  if (!sent) {
    throw new Error("Email is not configured.");
  }
}

/** Creates a challenge and emails the code. Throws if the email cannot be sent. */
export async function startLoginChallenge(user: {
  id: number;
  email: string;
  name: string;
}): Promise<{ challengeId: string; maskedEmail: string }> {
  const code = generateCode();

  const [created] = await db
    .insert(loginChallenges)
    .values({
      userId: user.id,
      codeHash: "pending",
      expiresAt: new Date(Date.now() + TWO_FACTOR_TTL_MS),
    })
    .returning({ id: loginChallenges.id });

  try {
    await db
      .update(loginChallenges)
      .set({ codeHash: hashCode(created.id, code) })
      .where(eq(loginChallenges.id, created.id));

    await sendTwoFactorEmail({ to: user.email, name: user.name, code });
  } catch (error) {
    await db.delete(loginChallenges).where(eq(loginChallenges.id, created.id));
    throw error;
  }

  return { challengeId: created.id, maskedEmail: maskEmail(user.email) };
}

export type VerifyChallengeResult =
  | { ok: true; userId: number }
  | {
      ok: false;
      reason: "invalid_challenge" | "expired" | "locked" | "wrong_code";
      attemptsLeft?: number;
    };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isChallengeId(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

export async function verifyLoginChallenge(
  challengeId: string,
  code: string,
): Promise<VerifyChallengeResult> {
  const [challenge] = await db
    .select()
    .from(loginChallenges)
    .where(eq(loginChallenges.id, challengeId))
    .limit(1);

  if (!challenge || challenge.consumedAt) {
    return { ok: false, reason: "invalid_challenge" };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (challenge.attempts >= TWO_FACTOR_MAX_ATTEMPTS) {
    return { ok: false, reason: "locked" };
  }

  const matches = hashesMatch(challenge.codeHash, hashCode(challenge.id, code));

  if (!matches) {
    const attempts = challenge.attempts + 1;
    await db
      .update(loginChallenges)
      .set({ attempts })
      .where(eq(loginChallenges.id, challenge.id));
    const attemptsLeft = Math.max(TWO_FACTOR_MAX_ATTEMPTS - attempts, 0);
    return {
      ok: false,
      reason: attemptsLeft === 0 ? "locked" : "wrong_code",
      attemptsLeft,
    };
  }

  // Atomic single-use: only one request can flip consumedAt from null.
  const consumed = await db
    .update(loginChallenges)
    .set({ consumedAt: new Date() })
    .where(
      and(eq(loginChallenges.id, challenge.id), isNull(loginChallenges.consumedAt)),
    )
    .returning({ id: loginChallenges.id });

  if (consumed.length === 0) {
    return { ok: false, reason: "invalid_challenge" };
  }

  return { ok: true, userId: challenge.userId };
}

export type ResendResult =
  | { ok: true; maskedEmail: string }
  | {
      ok: false;
      reason: "invalid_challenge" | "expired" | "cooldown" | "limit";
      retryAfterSeconds?: number;
    };

export async function resendLoginChallenge(
  challengeId: string,
  user: { email: string; name: string },
): Promise<ResendResult> {
  const [challenge] = await db
    .select()
    .from(loginChallenges)
    .where(eq(loginChallenges.id, challengeId))
    .limit(1);

  if (!challenge || challenge.consumedAt) {
    return { ok: false, reason: "invalid_challenge" };
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "expired" };
  }

  if (challenge.resendCount >= TWO_FACTOR_MAX_RESENDS) {
    return { ok: false, reason: "limit" };
  }

  const elapsed = Date.now() - challenge.lastSentAt.getTime();
  if (elapsed < TWO_FACTOR_RESEND_COOLDOWN_MS) {
    return {
      ok: false,
      reason: "cooldown",
      retryAfterSeconds: Math.ceil((TWO_FACTOR_RESEND_COOLDOWN_MS - elapsed) / 1000),
    };
  }

  const code = generateCode();
  await sendTwoFactorEmail({ to: user.email, name: user.name, code });

  await db
    .update(loginChallenges)
    .set({
      codeHash: hashCode(challenge.id, code),
      attempts: 0,
      resendCount: challenge.resendCount + 1,
      lastSentAt: new Date(),
      expiresAt: new Date(Date.now() + TWO_FACTOR_TTL_MS),
    })
    .where(eq(loginChallenges.id, challenge.id));

  return { ok: true, maskedEmail: maskEmail(user.email) };
}
