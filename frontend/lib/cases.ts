import type { AccountRole, AuthError } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type DivisionType =
  | "consultancy"
  | "operations"
  | "training"
  | "polygraph";

export type CasePriority = "low" | "medium" | "high" | "critical";
export const CASE_STATUSES = [
  "new",
  "urgent",
  "in_progress",
  "paused",
  "completed",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

export const CASE_STATUS_OPTIONS: { value: CaseStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "urgent", label: "Urgent" },
  { value: "in_progress", label: "In progress" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export function caseStatusLabel(status: CaseStatus): string {
  return CASE_STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

export function caseStatusBadgeVariant(
  status: CaseStatus,
): "muted" | "warning" | "accent" | "success" | "default" {
  switch (status) {
    case "urgent":
      return "warning";
    case "in_progress":
      return "accent";
    case "completed":
      return "success";
    case "paused":
      return "default";
    default:
      return "muted";
  }
}

export interface CaseAgent {
  id: number;
  name: string;
  email: string;
  role: AccountRole;
}

export interface CaseNote {
  id: number;
  body: string;
  createdAt: string;
  authorId: number;
  authorName: string;
}

export interface CaseRecord {
  id: number;
  referenceNumber: string;
  title: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  jurisdiction: string | null;
  divisionId: number;
  divisionType: DivisionType;
  divisionName: string;
  createdAt: string;
  updatedAt: string;
  agents: CaseAgent[];
  notes?: CaseNote[];
}

export interface CreateCasePayload {
  title: string;
  description?: string;
  divisionType: DivisionType;
  priority?: CasePriority;
  jurisdiction?: string;
  agentIds?: number[];
}

export function isCaseOpen(record: Pick<CaseRecord, "agents">): boolean {
  return record.agents.length === 0;
}

export function isAssignedToCase(
  record: Pick<CaseRecord, "agents">,
  userId: number,
): boolean {
  return record.agents.some((agent) => agent.id === userId);
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T | AuthError;
  if (!response.ok) {
    throw data as AuthError;
  }
  return data as T;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCases(token: string): Promise<CaseRecord[]> {
  const response = await fetch(`${API_URL}/cases`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ cases: CaseRecord[] }>(response);
  return data.cases;
}

export async function fetchCase(
  token: string,
  id: number,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases/${id}`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function createCase(
  token: string,
  payload: CreateCasePayload,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function fetchAssignableAgents(
  token: string,
): Promise<CaseAgent[]> {
  const response = await fetch(`${API_URL}/cases/agents`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ agents: CaseAgent[] }>(response);
  return data.agents;
}

export async function assignAgentToCase(
  token: string,
  caseId: number,
  agentId: number,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases/${caseId}/assignments`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ agentId }),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function unassignAgentFromCase(
  token: string,
  caseId: number,
  agentId: number,
): Promise<CaseRecord> {
  const response = await fetch(
    `${API_URL}/cases/${caseId}/assignments/${agentId}`,
    {
      method: "DELETE",
      headers: authHeaders(token),
    },
  );
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function addCaseNote(
  token: string,
  caseId: number,
  body: string,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases/${caseId}/notes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ body }),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function updateCaseStatus(
  token: string,
  caseId: number,
  status: CaseStatus,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases/${caseId}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}

export async function acceptCase(
  token: string,
  caseId: number,
): Promise<CaseRecord> {
  const response = await fetch(`${API_URL}/cases/${caseId}/accept`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = await parseJson<{ case: CaseRecord }>(response);
  return data.case;
}
