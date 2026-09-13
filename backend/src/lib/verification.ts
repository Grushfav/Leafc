import { createHash, randomBytes } from "node:crypto";
import { sendMail } from "./mailer.js";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function createEmailVerificationToken(): {
  raw: string;
  hash: string;
  expiresAt: Date;
} {
  const raw = randomBytes(32).toString("hex");
  return {
    raw,
    hash: hashEmailVerificationToken(raw),
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
  };
}

export function hashEmailVerificationToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function sendMemberVerificationEmail(options: {
  to: string;
  name: string;
  token: string;
}): Promise<void> {
  const origin = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  const verifyUrl = `${origin}/verify-email?token=${encodeURIComponent(options.token)}`;
  const firstName = options.name.trim().split(/\s+/)[0] || "there";

  const sent = await sendMail({
    to: options.to,
    subject: "Verify your LEAF-C member email",
    text: [
      `Hello ${firstName},`,
      "",
      "Confirm your email address to finish creating your LEAF-C member account.",
      "",
      verifyUrl,
      "",
      "This link expires in 24 hours. If you did not request this account, ignore this email.",
      "",
      "LEAF-C",
    ].join("\n"),
    html: `
      <p>Hello ${escapeHtml(firstName)},</p>
      <p>Confirm your email address to finish creating your LEAF-C member account.</p>
      <p><a href="${escapeHtml(verifyUrl)}">Verify email address</a></p>
      <p>This link expires in 24 hours. If you did not request this account, ignore this email.</p>
      <p>LEAF-C</p>
    `,
  });

  if (!sent) {
    throw new Error("SES SMTP is not configured.");
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
