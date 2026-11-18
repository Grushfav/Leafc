import { createHash, randomBytes } from "node:crypto";
import { emailParagraph, escapeHtml, renderEmail } from "./email-template.js";
import { sendMail } from "./mailer.js";
import { emailSiteOrigin } from "./site-origin.js";

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
  const origin = emailSiteOrigin();
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
    html: renderEmail({
      preheader: "Confirm your email address to finish creating your LEAF-C member account.",
      heading: "Verify your email address",
      bodyHtml: [
        emailParagraph(`Hello ${escapeHtml(firstName)},`),
        emailParagraph(
          "Confirm your email address to finish creating your LEAF-C member account.",
        ),
        emailParagraph("This link expires in 24 hours."),
      ].join(""),
      button: { label: "Verify email address", url: verifyUrl },
      footerNote: "If you did not request this account, ignore this email.",
    }),
  });

  if (!sent) {
    throw new Error("Email is not configured.");
  }
}