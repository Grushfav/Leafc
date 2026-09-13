import nodemailer from "nodemailer";

const fromAddress = process.env.SES_FROM_EMAIL ?? "info@leafc.net";
const fromName = process.env.SES_FROM_NAME ?? "LEAF-C";
const region = process.env.AWS_SES_REGION ?? "us-east-1";
const host =
  process.env.SES_SMTP_HOST ?? `email-smtp.${region}.amazonaws.com`;
const port = Number(process.env.SES_SMTP_PORT ?? 587);

export function isMailConfigured(): boolean {
  return Boolean(process.env.SES_SMTP_USER && process.env.SES_SMTP_PASSWORD);
}

function createTransport() {
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SES_SMTP_USER,
      pass: process.env.SES_SMTP_PASSWORD,
    },
  });
}

export async function sendMail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<boolean> {
  if (!isMailConfigured()) {
    console.warn("SES SMTP is not configured; skipped email:", options.subject);
    return false;
  }

  await createTransport().sendMail({
    from: `${fromName} <${fromAddress}>`,
    replyTo: fromAddress,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });

  return true;
}
