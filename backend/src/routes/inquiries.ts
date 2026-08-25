import { Router } from "express";
import { serviceInquiries } from "../db/schema.js";
import { db } from "../db/index.js";

export const inquiriesRouter = Router();

const CLIENT_TYPES = ["private", "corporate", "government", "ngo"] as const;
const SERVICE_INTERESTS = [
  "consultancy",
  "operations",
  "training",
  "polygraph",
  "multiple",
  "unsure",
] as const;

type ClientType = (typeof CLIENT_TYPES)[number];
type ServiceInterest = (typeof SERVICE_INTERESTS)[number];

interface InquiryBody {
  fullName?: string;
  email?: string;
  phone?: string;
  organization?: string;
  clientType?: string;
  serviceInterest?: string;
  message?: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createReferenceNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INQ-${stamp}-${suffix}`;
}

function validateInquiry(body: InquiryBody) {
  const errors: Record<string, string> = {};

  if (!isNonEmptyString(body.fullName)) {
    errors.fullName = "Full name is required.";
  }

  if (!isNonEmptyString(body.email)) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(body.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!isNonEmptyString(body.clientType)) {
    errors.clientType = "Select who you are enquiring on behalf of.";
  } else if (!CLIENT_TYPES.includes(body.clientType as ClientType)) {
    errors.clientType = "Invalid client type.";
  }

  if (!isNonEmptyString(body.serviceInterest)) {
    errors.serviceInterest = "Select a service of interest.";
  } else if (
    !SERVICE_INTERESTS.includes(body.serviceInterest as ServiceInterest)
  ) {
    errors.serviceInterest = "Invalid service selection.";
  }

  if (!isNonEmptyString(body.message)) {
    errors.message = "Please describe your needs.";
  } else if (body.message.trim().length < 20) {
    errors.message = "Please provide at least 20 characters.";
  }

  if (body.phone !== undefined && body.phone !== "" && typeof body.phone !== "string") {
    errors.phone = "Invalid phone number.";
  }

  if (
    body.organization !== undefined &&
    body.organization !== "" &&
    typeof body.organization !== "string"
  ) {
    errors.organization = "Invalid organisation name.";
  }

  return errors;
}

inquiriesRouter.post("/", async (req, res) => {
  const body = req.body as InquiryBody;
  const errors = validateInquiry(body);

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  const referenceNumber = createReferenceNumber();

  try {
    const [inquiry] = await db
      .insert(serviceInquiries)
      .values({
        referenceNumber,
        fullName: body.fullName!.trim(),
        email: body.email!.trim().toLowerCase(),
        phone: body.phone?.trim() || null,
        organization: body.organization?.trim() || null,
        clientType: body.clientType as ClientType,
        serviceInterest: body.serviceInterest as ServiceInterest,
        message: body.message!.trim(),
      })
      .returning({
        referenceNumber: serviceInquiries.referenceNumber,
        createdAt: serviceInquiries.createdAt,
      });

    res.status(201).json({
      message: "Inquiry submitted successfully.",
      referenceNumber: inquiry.referenceNumber,
      submittedAt: inquiry.createdAt,
    });
  } catch (error) {
    console.error("Failed to create service inquiry:", error);
    res.status(500).json({
      error: "Unable to submit inquiry right now. Please try again shortly.",
    });
  }
});
