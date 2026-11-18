import {
  emailDetailsTable,
  emailParagraph,
  escapeHtml,
  renderEmail,
} from "./email-template.js";
import { sendMail } from "./mailer.js";

const notifyAddress = process.env.SES_NOTIFY_EMAIL ?? "support@leafc.net";

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

  const staffHtml = renderEmail({
    preheader: `New inquiry ${inquiry.referenceNumber} from ${inquiry.fullName} - ${service}`,
    heading: "New service inquiry",
    bodyHtml: [
      emailParagraph(
        `New LEAF-C service inquiry <strong>${escapeHtml(inquiry.referenceNumber)}</strong>`,
      ),
      emailDetailsTable([
        ["Name", inquiry.fullName],
        ["Email", inquiry.email],
        ["Phone", phone],
        ["Organisation", organization],
        ["Client type", client],
        ["Service", service],
      ]),
      emailParagraph(escapeHtml(inquiry.message).replaceAll("\n", "<br />")),
    ].join(""),
    footerNote: "Internal notification: reply to the client directly at the email address above.",
  });

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

  const confirmHtml = renderEmail({
    preheader: `We have received your inquiry (${inquiry.referenceNumber}) and will respond within two business days.`,
    heading: "We have received your inquiry",
    bodyHtml: [
      emailParagraph(`Dear ${escapeHtml(inquiry.fullName)},`),
      emailParagraph(
        "Thank you for contacting LEAF-C — Law Enforcement Against Financial Crimes.",
      ),
      emailParagraph(
        `We have received your inquiry (<strong>${escapeHtml(inquiry.referenceNumber)}</strong>) and will respond within two business days.`,
      ),
      emailParagraph("If you need to add information, reply to this email."),
    ].join(""),
  });

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
