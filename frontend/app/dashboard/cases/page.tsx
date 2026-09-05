"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminRole, isStaffRole, roleLabel, type AuthError } from "@/lib/auth";
import {
  acceptCase,
  createCase,
  fetchAssignableAgents,
  fetchCases,
  caseStatusBadgeVariant,
  caseStatusLabel,
  isAssignedToCase,
  isCaseOpen,
  type CaseAgent,
  type CasePriority,
  type CaseRecord,
  type DivisionType,
} from "@/lib/cases";

const DIVISION_OPTIONS: { value: DivisionType; label: string }[] = [
  { value: "consultancy", label: "Consultancy" },
  { value: "operations", label: "Operations" },
  { value: "training", label: "Training" },
  { value: "polygraph", label: "Polygraph & Integrity" },
];

const PRIORITY_OPTIONS: { value: CasePriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

export default function CasesPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [agents, setAgents] = useState<CaseAgent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [divisionType, setDivisionType] = useState<DivisionType | "">("");
  const [priority, setPriority] = useState<CasePriority>("medium");
  const [jurisdiction, setJurisdiction] = useState("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);

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

    const load = isAdminRole(user.role)
      ? Promise.all([fetchCases(token), fetchAssignableAgents(token)])
      : Promise.all([fetchCases(token), Promise.resolve([] as CaseAgent[])]);

    load
      .then(([nextCases, nextAgents]) => {
        setCases(nextCases);
        setAgents(nextAgents);
      })
      .catch((error: AuthError) => {
        setLoadError(error.error ?? "Unable to load cases.");
      });
  }, [token, user]);

  function toggleAgent(id: number) {
    setSelectedAgentIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function handleAccept(caseId: number) {
    if (!token) return;
    setAcceptingId(caseId);
    setAcceptError(null);
    try {
      const next = await acceptCase(token, caseId);
      setCases((current) =>
        current.map((item) => (item.id === next.id ? next : item)),
      );
      router.push(`/dashboard/cases/workspace?id=${next.id}`);
    } catch (error) {
      const apiError = error as AuthError;
      setAcceptError(apiError.error ?? "Unable to accept the case.");
    } finally {
      setAcceptingId(null);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Case title is required.";
    if (!divisionType) nextErrors.divisionType = "Select a division.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      const created = await createCase(token, {
        title: title.trim(),
        description: description.trim() || undefined,
        divisionType: divisionType as DivisionType,
        priority,
        jurisdiction: jurisdiction.trim() || undefined,
        agentIds: selectedAgentIds,
      });
      setCases((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setDivisionType("");
      setPriority("medium");
      setJurisdiction("");
      setSelectedAgentIds([]);
      router.push(`/dashboard/cases/workspace?id=${created.id}`);
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to create the case.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady || !user || !isStaffRole(user.role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading cases…
      </div>
    );
  }

  return (
    <DashboardShell
      title="Cases"
      description={
        isAdmin
          ? "Create investigation cases, assign agents, or leave a case open for members to accept."
          : "Accept an open case to work it, or open a case assigned to you."
      }
    >
      {isAdmin ? (
        <Card id="create-case" variant="featured" className="scroll-mt-24">
          <CardHeader>
            <CardTitle>Create a case</CardTitle>
            <CardDescription>
              Open a new case and optionally assign senior agents or agents now.
              If none are selected, the case stays open for members to accept.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleCreate} noValidate className="space-y-5">
              <Input
                label="Title"
                name="title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                error={errors.title}
              />
              <Textarea
                label="Description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                error={errors.description}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Select
                  label="Division"
                  name="divisionType"
                  required
                  value={divisionType}
                  onChange={(event) =>
                    setDivisionType(event.target.value as DivisionType | "")
                  }
                  options={DIVISION_OPTIONS}
                  placeholder="Select division"
                  error={errors.divisionType}
                />
                <Select
                  label="Priority"
                  name="priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as CasePriority)
                  }
                  options={PRIORITY_OPTIONS}
                />
              </div>
              <Input
                label="Jurisdiction"
                name="jurisdiction"
                value={jurisdiction}
                onChange={(event) => setJurisdiction(event.target.value)}
              />
              <fieldset>
                <legend className="font-heading text-sm font-medium text-heading">
                  Assign agents
                </legend>
                <p className="mt-1 text-sm text-muted-foreground">
                  Leave unchecked to leave this case open for members to accept.
                </p>
                {agents.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No senior agents or agents are registered yet.
                  </p>
                ) : (
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {agents.map((agent) => {
                      const checked = selectedAgentIds.includes(agent.id);
                      return (
                        <li key={agent.id}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-3 text-sm">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={checked}
                              onChange={() => toggleAgent(agent.id)}
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
              </fieldset>
              {submitError ? (
                <p className="text-sm text-error" role="alert">
                  {submitError}
                </p>
              ) : null}
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create case"}
              </Button>
            </form>
          </CardBody>
        </Card>
      ) : null}

      {loadError ? (
        <p className="mt-6 text-sm text-error" role="alert">
          {loadError}
        </p>
      ) : null}

      {acceptError ? (
        <p className="mt-6 text-sm text-error" role="alert">
          {acceptError}
        </p>
      ) : null}

      <Card variant="elevated" className={isAdmin ? "mt-8 overflow-hidden" : "overflow-hidden"}>
        <CardHeader>
          <CardTitle>Cases</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Open cases have no assignees. Assigned cases already have one or more members."
              : "Open cases you can accept, plus cases assigned to you."}
          </CardDescription>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {cases.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              {isMember ? "No open or assigned cases yet." : "No cases yet."}
            </p>
          ) : (
            <table className="table-styled w-full text-sm">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Title</th>
                  <th>Division</th>
                  <th>Status</th>
                  <th>Assignment</th>
                  <th>Agents</th>
                  <th>Opened</th>
                  {isMember ? <th>Action</th> : null}
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => {
                  const open = isCaseOpen(item);
                  const mine = isAssignedToCase(item, user.id);
                  return (
                    <tr key={item.id}>
                      <td className="font-mono text-xs">
                        <Link
                          href={`/dashboard/cases/workspace?id=${item.id}`}
                          className="font-medium text-brand-orange hover:underline"
                        >
                          {item.referenceNumber}
                        </Link>
                      </td>
                      <td>{item.title}</td>
                      <td>{item.divisionName}</td>
                      <td>
                        <Badge variant={caseStatusBadgeVariant(item.status)}>
                          {caseStatusLabel(item.status)}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant={open ? "outline-navy" : "success"}>
                          {open ? "Open" : "Assigned"}
                        </Badge>
                      </td>
                      <td>
                        {open
                          ? "Unassigned"
                          : item.agents.map((agent) => agent.name).join(", ")}
                      </td>
                      <td className="text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                      {isMember ? (
                        <td>
                          {open && !mine ? (
                            <Button
                              variant="accent"
                              size="sm"
                              disabled={acceptingId === item.id}
                              onClick={() => handleAccept(item.id)}
                            >
                              {acceptingId === item.id ? "Accepting..." : "Accept"}
                            </Button>
                          ) : mine ? (
                            <span className="text-xs text-muted-foreground">
                              Yours
                            </span>
                          ) : null}
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
