export const CLIENT_TYPE_OPTIONS = [
  { value: "private", label: "Private individual" },
  { value: "corporate", label: "Corporate / enterprise" },
  { value: "government", label: "Government agency" },
  { value: "ngo", label: "NGO / institution" },
] as const;

export const SERVICE_INTEREST_OPTIONS = [
  { value: "consultancy", label: "Consultancy & advisory" },
  { value: "operations", label: "Investigations & operations" },
  { value: "training", label: "Training & certification" },
  { value: "polygraph", label: "Polygraph & integrity testing" },
  { value: "multiple", label: "Multiple services" },
  { value: "unsure", label: "Not sure yet — need guidance" },
] as const;

export type ClientType = (typeof CLIENT_TYPE_OPTIONS)[number]["value"];
export type ServiceInterest = (typeof SERVICE_INTEREST_OPTIONS)[number]["value"];

export interface ServiceInquiryPayload {
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  clientType: ClientType;
  serviceInterest: ServiceInterest;
  message: string;
}

export interface ServiceInquiryResponse {
  message: string;
  referenceNumber: string;
  submittedAt: string;
}

export interface ServiceInquiryError {
  error: string;
  fields?: Record<string, string>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function submitServiceInquiry(
  payload: ServiceInquiryPayload,
): Promise<ServiceInquiryResponse> {
  const response = await fetch(`${API_URL}/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as
    | ServiceInquiryResponse
    | ServiceInquiryError;

  if (!response.ok) {
    const error = data as ServiceInquiryError;
    throw error;
  }

  return data as ServiceInquiryResponse;
}
