import { createHash, randomBytes } from "node:crypto";
import { emailParagraph, escapeHtml, renderEmail } from "./email-template.js";
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
    html: renderEmail({
      preheader: "Confirm your LEAF-C newsletter subscription.",
      heading: "Confirm your subscription",
      bodyHtml: [
        emailParagraph(
          "Confirm that you want emails from LEAF-C about programmes, updates, and occasional promotions.",
        ),
        emailParagraph("This link expires in 72 hours."),
      ].join(""),
      button: { label: "Confirm subscription", url: confirmUrl },
      footerNote: "If you did not request this, ignore this email.",
    }),
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
    html: renderEmail({
      preheader: "You are subscribed to the LEAF-C newsletter.",
      heading: "You are subscribed",
      bodyHtml: emailParagraph(
        "You are subscribed. We will email you about programmes, updates, and occasional promotions.",
      ),
      footerLink: { label: "Unsubscribe", url: unsubscribeUrl },
    }),
  });
}

export async function sendNewsletterBroadcastEmail(options: {
  to: string;
  subject: string;
  body: string;
  unsubscribeToken: string;
}): Promise<boolean> {
  const unsubscribeUrl = `${emailSiteOrigin()}/newsletter/unsubscribe?token=${encodeURIComponent(options.unsubscribeToken)}`;
  const htmlBody = escapeHtml(options.body).replaceAll("\n", "<br>");

  return sendMail({
    to: options.to,
    subject: options.subject,
    text: [
      options.body,
      "",
      "Unsubscribe at any time:",
      unsubscribeUrl,
      "",
      "LEAF-C",
    ].join("\n"),
    html: renderEmail({
      preheader: options.body.replace(/\s+/g, " ").trim().slice(0, 120),
      heading: options.subject,
      bodyHtml: emailParagraph(htmlBody),
      footerLink: { label: "Unsubscribe", url: unsubscribeUrl },
    }),
  });
}
