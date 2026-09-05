"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminRole, isStaffRole, roleLabel, type AuthError } from "@/lib/auth";
import {
  acceptCase,
  addCaseNote,
  assignAgentToCase,
  CASE_STATUS_OPTIONS,
  caseStatusBadgeVariant,
  caseStatusLabel,
  fetchAssignableAgents,
  fetchCase,
  isAssignedToCase,
  isCaseOpen,
  unassignAgentFromCase,
  updateCaseStatus,
  type CaseAgent,
  type CaseRecord,
  type CaseStatus,
} from "@/lib/cases";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function CaseWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = Number(searchParams.get("id"));
  const { user, token, isReady } = useAuth();
  const [record, setRecord] = useState<CaseRecord | null>(null);
  const [agents, setAgents] = useState<CaseAgent[]>([]);
  const [note, setNote] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [pendingAgentId, setPendingAgentId] = useState<number | null>(null);
  const [isNotating, setIsNotating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const isAdmin = Boolean(user && isAdminRole(user.role));
  const isMember = Boolean(user && isStaffRole(user.role) && !isAdminRole(user.role));

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token) {
      router.replace("/login");
      return;
    }
    if (!isStaffRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !user || !isStaffRole(user.role)) return;
    if (!Number.isInteger(caseId) || caseId <= 0) {
      router.replace("/dashboard/cases");
      return;
    }

    const load = isAdminRole(user.role)
      ? Promise.all([fetchCase(token, caseId), fetchAssignableAgents(token)])
      : Promise.all([fetchCase(token, caseId), Promise.resolve([] as CaseAgent[])]);

    load
      .then(([nextCase, nextAgents]) => {
        setRecord(nextCase);
        setAgents(nextAgents);
      })
      .catch((error: AuthError) => {
        setLoadError(error.error ?? "Unable to load this case.");
      });
  }, [token, user, caseId, router]);

  async function toggleAssignment(agentId: number, assigned: boolean) {
    if (!token || !record) return;
    setPendingAgentId(agentId);
    setAssignError(null);
    try {
      const next = assigned
        ? await unassignAgentFromCase(token, record.id, agentId)
        : await assignAgentToCase(token, record.id, agentId);
      setRecord(next);
    } catch (error) {
      const apiError = error as AuthError;
      setAssignError(apiError.error ?? "Unable to update assignments.");
    } finally {
      setPendingAgentId(null);
    }
  }

  async function handleStatusChange(status: CaseStatus) {
    if (!token || !record || status === record.status) return;
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      setRecord(await updateCaseStatus(token, record.id, status));
    } catch (error) {
      const apiError = error as AuthError;
      setStatusError(apiError.error ?? "Unable to update status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleAccept() {
    if (!token || !record) return;
    setIsAccepting(true);
    setAcceptError(null);
    try {
      setRecord(await acceptCase(token, record.id));
    } catch (error) {
      const apiError = error as AuthError;
      setAcceptError(apiError.error ?? "Unable to accept the case.");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !record) return;
    if (!note.trim()) {
      setNoteError("Enter a note.");
      return;
    }

    setIsNotating(true);
    setNoteError(null);
    try {
      const next = await addCaseNote(token, record.id, note.trim());
      setRecord(next);
      setNote("");
    } catch (error) {
      const apiError = error as AuthError;
      setNoteError(apiError.fields?.body ?? apiError.error ?? "Unable to add the note.");
    } finally {
      setIsNotating(false);
    }
  }

  if (!isReady || !user || !isStaffRole(user.role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading case…
      </div>
    );
  }

  if (loadError) {
    return (
      <DashboardShell title="Case" description="Case workspace.">
        <p className="text-sm text-error" role="alert">
          {loadError}
        </p>
        <Link
          href="/dashboard/cases"
          className="mt-4 inline-block text-sm font-medium text-brand-orange hover:underline"
        >
          Back to cases
        </Link>
      </DashboardShell>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading case…
      </div>
    );
  }

  const assignedIds = new Set(record.agents.map((agent) => agent.id));
  const open = isCaseOpen(record);
  const assignedToMe = isAssignedToCase(record, user.id);
  const canAccept = isMember && open && !assignedToMe;
  const canNotate = isAdmin || assignedToMe;

  return (
    <DashboardShell
      title={record.title}
      description={`${record.referenceNumber} · ${record.divisionName}`}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link
          href="/dashboard/cases"
          className="text-sm font-medium text-brand-orange hover:underline"
        >
          ← All cases
        </Link>
        <Badge variant={caseStatusBadgeVariant(record.status)}>
          {caseStatusLabel(record.status)}
        </Badge>
        <Badge
          variant={
            record.priority === "critical" || record.priority === "high"
              ? "warning"
              : "muted"
          }
        >
          {record.priority}
        </Badge>
        <Badge variant={open ? "outline-navy" : "success"}>
          {open ? "Open" : "Assigned"}
        </Badge>
      </div>

      {isAdmin ? (
        <Card variant="featured" className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle>Ticket status</CardTitle>
            <CardDescription>
              New, urgent, in progress, paused, or completed.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Select
              label="Status"
              name="status"
              value={record.status}
              disabled={isUpdatingStatus}
              onChange={(event) =>
                handleStatusChange(event.target.value as CaseStatus)
              }
              options={CASE_STATUS_OPTIONS}
            />
            {statusError ? (
              <p className="mt-3 text-sm text-error" role="alert">
                {statusError}
              </p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      {record.description ? (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {record.description}
        </p>
      ) : null}

      {canAccept ? (
        <Card variant="featured" className="mb-8 max-w-xl">
          <CardHeader>
            <CardTitle>Open for members</CardTitle>
            <CardDescription>
              Accept this case to work it and add notations.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Button
              variant="accent"
              disabled={isAccepting}
              onClick={() => {
                void handleAccept();
              }}
            >
              {isAccepting ? "Accepting..." : "Accept case"}
            </Button>
            {acceptError ? (
              <p className="mt-3 text-sm text-error" role="alert">
                {acceptError}
              </p>
            ) : null}
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {isAdmin ? (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Assigned agents</CardTitle>
              <CardDescription>
                Admins can assign or remove senior agents and agents on this case.
                Leave everyone unchecked to keep the case open for members.
              </CardDescription>
            </CardHeader>
            <CardBody>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No senior agents or agents are registered yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {agents.map((agent) => {
                    const assigned = assignedIds.has(agent.id);
                    return (
                      <li key={agent.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-subtle px-3 py-3 text-sm">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={assigned}
                            disabled={pendingAgentId === agent.id}
                            onChange={() => toggleAssignment(agent.id, assigned)}
                          />
                          <span>
                            <span className="block font-medium text-heading">
                              {agent.name}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {roleLabel(agent.role)} · {agent.email}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              {assignError ? (
                <p className="mt-3 text-sm text-error" role="alert">
                  {assignError}
                </p>
              ) : null}
            </CardBody>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Assigned agents</CardTitle>
              <CardDescription>
                {open
                  ? "This case is open. Accept it to join the assignment."
                  : "Members currently assigned to this case."}
              </CardDescription>
            </CardHeader>
            <CardBody>
              {record.agents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Unassigned</p>
              ) : (
                <ul className="space-y-2">
                  {record.agents.map((agent) => (
                    <li
                      key={agent.id}
                      className="rounded-xl border border-border-subtle px-3 py-3 text-sm"
                    >
                      <span className="block font-medium text-heading">
                        {agent.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {roleLabel(agent.role)} · {agent.email}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        )}

        {canNotate ? (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Case notations</CardTitle>
              <CardDescription>
                Add a dated note to the case record. Notes cannot be edited once
                posted.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleNote} className="space-y-4">
                <Textarea
                  label="New note"
                  name="body"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  error={noteError ?? undefined}
                />
                <Button type="submit" variant="accent" disabled={isNotating}>
                  {isNotating ? "Saving..." : "Add notation"}
                </Button>
              </form>
              <ul className="mt-6 space-y-4">
                {(record.notes ?? []).length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No notations yet.
                  </li>
                ) : (
                  (record.notes ?? []).map((item) => (
                    <li
                      key={item.id}
                      className="rounded-xl border border-border-subtle bg-warm-cream/60 px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-heading">
                        {item.body}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {item.authorName} · {formatDate(item.createdAt)}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </CardBody>
          </Card>
        ) : (
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Case notations</CardTitle>
              <CardDescription>
                Accept this case to add and view notations.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-muted-foreground">
                Notations are available after you accept the case.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}

export default function CaseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
          Loading case…
        </div>
      }
    >
      <CaseWorkspace />
    </Suspense>
  );
}
