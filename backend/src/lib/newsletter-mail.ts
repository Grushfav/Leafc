import { createHash, randomBytes } from "node:crypto";
import { sendMail } from "./mailer.js";
import { emailSiteOrigin } from "./site-origin.js";

const CONFIRM_TTL_MS = 72 * 60 * 60 * 1000;

export function createNewsletterToken(): {
  raw: string;
  hash: string;
  expiresAt: Date;
} {
  const raw = randomBytes(32).toString("hex");
  return {
    raw,
    hash: hashNewsletterToken(raw),
    expiresAt: new Date(Date.now() + CONFIRM_TTL_MS),
  };
}

export function hashNewsletterToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendNewsletterConfirmEmail(options: {
  to: string;
  token: string;
}): Promise<boolean> {
  const confirmUrl = `${emailSiteOrigin()}/newsletter/confirm?token=${encodeURIComponent(options.token)}`;

  return sendMail({
    to: options.to,
    subject: "Confirm your LEAF-C newsletter subscription",
    text: [
      "Confirm that you want emails from LEAF-C about programmes, updates, and occasional promotions.",
      "",
      confirmUrl,
      "",
      "This link expires in 72 hours. If you did not request this, ignore this email.",
      "",
      "LEAF-C",
    ].join("\n"),
    html: `
      <p>Confirm that you want emails from LEAF-C about programmes, updates, and occasional promotions.</p>
      <p><a href="${escapeHtml(confirmUrl)}">Confirm subscription</a></p>
      <p>This link expires in 72 hours. If you did not request this, ignore this email.</p>
      <p>LEAF-C</p>
    `,
  });
}

export async function sendNewsletterWelcomeEmail(options: {
  to: string;
  unsubscribeToken: string;
}): Promise<boolean> {
  const unsubscribeUrl = `${emailSiteOrigin()}/newsletter/unsubscribe?token=${encodeURIComponent(options.unsubscribeToken)}`;

  return sendMail({
    to: options.to,
    subject: "You are subscribed to the LEAF-C newsletter",
    text: [
      "You are subscribed. We will email you about programmes, updates, and occasional promotions.",
      "",
      "Unsubscribe at any time:",
      unsubscribeUrl,
      "",
      "LEAF-C",
    ].join("\n"),
    html: `
      <p>You are subscribed. We will email you about programmes, updates, and occasional promotions.</p>
      <p><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>
      <p>LEAF-C</p>
    `,
  });
}
