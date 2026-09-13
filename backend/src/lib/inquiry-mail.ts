import { sendMail } from "./mailer.js";

const notifyAddress = process.env.SES_NOTIFY_EMAIL ?? "info@leafc.net";

const CLIENT_LABELS: Record<string, string> = {
  private: "Private individual",
  corporate: "Corporate",
  government: "Government",
  ngo: "NGO",
};

const SERVICE_LABELS: Record<string, string> = {
  consultancy: "Consultancy",
  operations: "Operations / investigations",
  training: "Training",
  polygraph: "Polygraph testing",
  multiple: "Multiple services",
  unsure: "Unsure",
};

export interface InquiryMailPayload {
  referenceNumber: string;
  fullName: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  clientType: string;
  serviceInterest: string;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendInquiryEmails(inquiry: InquiryMailPayload): Promise<void> {
  const client = CLIENT_LABELS[inquiry.clientType] ?? inquiry.clientType;
  const service = SERVICE_LABELS[inquiry.serviceInterest] ?? inquiry.serviceInterest;
  const phone = inquiry.phone?.trim() || "Not provided";
  const organization = inquiry.organization?.trim() || "Not provided";

  const staffText = [
    `New LEAF-C service inquiry ${inquiry.referenceNumber}`,
    "",
    `Name: ${inquiry.fullName}`,
    `Email: ${inquiry.email}`,
    `Phone: ${phone}`,
    `Organisation: ${organization}`,
    `Client type: ${client}`,
    `Service: ${service}`,
    "",
    inquiry.message,
  ].join("\n");

  const staffHtml = `
    <p>New LEAF-C service inquiry <strong>${escapeHtml(inquiry.referenceNumber)}</strong></p>
    <p>
      <strong>Name:</strong> ${escapeHtml(inquiry.fullName)}<br />
      <strong>Email:</strong> ${escapeHtml(inquiry.email)}<br />
      <strong>Phone:</strong> ${escapeHtml(phone)}<br />
      <strong>Organisation:</strong> ${escapeHtml(organization)}<br />
      <strong>Client type:</strong> ${escapeHtml(client)}<br />
      <strong>Service:</strong> ${escapeHtml(service)}
    </p>
    <p>${escapeHtml(inquiry.message).replaceAll("\n", "<br />")}</p>
  `;

  const confirmText = [
    `Dear ${inquiry.fullName},`,
    "",
    "Thank you for contacting LEAF-C — Law Enforcement Against Financial Crimes.",
    `We have received your inquiry (${inquiry.referenceNumber}) and will respond within two business days.`,
    "",
    "If you need to add information, reply to this email.",
    "",
    "LEAF-C",
  ].join("\n");

  const confirmHtml = `
    <p>Dear ${escapeHtml(inquiry.fullName)},</p>
    <p>Thank you for contacting LEAF-C — Law Enforcement Against Financial Crimes.</p>
    <p>We have received your inquiry (<strong>${escapeHtml(inquiry.referenceNumber)}</strong>) and will respond within two business days.</p>
    <p>If you need to add information, reply to this email.</p>
    <p>LEAF-C</p>
  `;

  await Promise.all([
    sendMail({
      to: notifyAddress,
      subject: `New inquiry ${inquiry.referenceNumber} — ${service}`,
      text: staffText,
      html: staffHtml,
    }),
    sendMail({
      to: inquiry.email,
      subject: `LEAF-C inquiry received — ${inquiry.referenceNumber}`,
      text: confirmText,
      html: confirmHtml,
    }),
  ]);
}
