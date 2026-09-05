import type { AuthError } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const SESSION_STATUSES = [
  "scheduled",
  "cancelled",
  "completed",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_STATUS_OPTIONS: { value: SessionStatus; label: string }[] =
  [
    { value: "scheduled", label: "Scheduled" },
    { value: "cancelled", label: "Cancelled" },
    { value: "completed", label: "Completed" },
  ];

export function sessionStatusLabel(status: SessionStatus): string {
  return (
    SESSION_STATUS_OPTIONS.find((item) => item.value === status)?.label ??
    status
  );
}

export function sessionStatusBadgeVariant(
  status: SessionStatus,
): "success" | "warning" | "muted" {
  switch (status) {
    case "scheduled":
      return "success";
    case "cancelled":
      return "warning";
    default:
      return "muted";
  }
}

export interface TrainingSession {
  id: number;
  programId: number | null;
  programTitle: string | null;
  title: string;
  description: string | null;
  scheduledAt: string;
  location: string | null;
  durationDays: number | null;
  maxSeats: number | null;
  status: SessionStatus;
  createdById: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainingSessionPayload {
  title: string;
  scheduledAt: string;
  description?: string;
  location?: string;
  durationDays?: number;
}

export interface UpdateTrainingSessionPayload {
  title?: string;
  scheduledAt?: string;
  description?: string | null;
  location?: string | null;
  durationDays?: number | null;
  status?: SessionStatus;
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

export async function fetchTrainingSessions(
  token: string,
): Promise<TrainingSession[]> {
  const response = await fetch(`${API_URL}/training/sessions`, {
    headers: authHeaders(token),
  });
  const data = await parseJson<{ sessions: TrainingSession[] }>(response);
  return data.sessions;
}

export async function createTrainingSession(
  token: string,
  payload: CreateTrainingSessionPayload,
): Promise<TrainingSession> {
  const response = await fetch(`${API_URL}/training/sessions`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ session: TrainingSession }>(response);
  return data.session;
}

export async function updateTrainingSession(
  token: string,
  id: number,
  payload: UpdateTrainingSessionPayload,
): Promise<TrainingSession> {
  const response = await fetch(`${API_URL}/training/sessions/${id}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const data = await parseJson<{ session: TrainingSession }>(response);
  return data.session;
}
