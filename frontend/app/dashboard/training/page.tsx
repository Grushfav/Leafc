"use client";

import { useEffect, useState, type FormEvent } from "react";
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
import { isAdminRole, isStaffRole, type AuthError } from "@/lib/auth";
import {
  createTrainingSession,
  fetchTrainingSessions,
  SESSION_STATUS_OPTIONS,
  sessionStatusBadgeVariant,
  sessionStatusLabel,
  updateTrainingSession,
  type SessionStatus,
  type TrainingSession,
} from "@/lib/training";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function toIsoFromDatetimeLocal(value: string): string {
  return new Date(value).toISOString();
}

export default function TrainingPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isAdmin = Boolean(user && isAdminRole(user.role));

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

    fetchTrainingSessions(token)
      .then(setSessions)
      .catch((error: AuthError) => {
        setLoadError(error.error ?? "Unable to load training sessions.");
      });
  }, [token, user]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors.title = "Session title is required.";
    if (!scheduledAt) {
      nextErrors.scheduledAt = "Choose a date and time.";
    } else if (Number.isNaN(new Date(scheduledAt).getTime())) {
      nextErrors.scheduledAt = "A valid scheduled date and time is required.";
    }
    if (durationDays.trim()) {
      const days = Number(durationDays);
      if (!Number.isInteger(days) || days <= 0) {
        nextErrors.durationDays = "Duration must be a whole number of days.";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      const created = await createTrainingSession(token, {
        title: title.trim(),
        scheduledAt: toIsoFromDatetimeLocal(scheduledAt),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        durationDays: durationDays.trim()
          ? Number(durationDays)
          : undefined,
      });
      setSessions((current) => {
        const next = [...current, created];
        next.sort((a, b) => {
          const aPast = new Date(a.scheduledAt).getTime() < Date.now();
          const bPast = new Date(b.scheduledAt).getTime() < Date.now();
          if (aPast !== bPast) return aPast ? 1 : -1;
          return (
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
          );
        });
        return next;
      });
      setTitle("");
      setScheduledAt("");
      setDescription("");
      setLocation("");
      setDurationDays("");
    } catch (error) {
      const apiError = error as AuthError;
      if (apiError.fields) setErrors(apiError.fields);
      setSubmitError(apiError.error ?? "Unable to schedule the session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(id: number, status: SessionStatus) {
    if (!token) return;
    setUpdatingId(id);
    setUpdateError(null);
    try {
      const next = await updateTrainingSession(token, id, { status });
      setSessions((current) =>
        current.map((item) => (item.id === next.id ? next : item)),
      );
    } catch (error) {
      const apiError = error as AuthError;
      setUpdateError(apiError.error ?? "Unable to update the session.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (!isReady || !user || !isStaffRole(user.role)) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        Loading training…
      </div>
    );
  }

  return (
    <DashboardShell
      title="Training"
      description={
        isAdmin
          ? "Schedule training sessions and keep members informed of upcoming dates."
          : "Upcoming and past training sessions scheduled by LEAF-C admins."
      }
    >
      {isAdmin ? (
        <Card variant="featured">
          <CardHeader>
            <CardTitle>Schedule a session</CardTitle>
            <CardDescription>
              Create a training session with a title and scheduled date. Location
              and duration are optional.
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
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Scheduled date and time"
                  name="scheduledAt"
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  error={errors.scheduledAt}
                />
                <Input
                  label="Duration (days)"
                  name="durationDays"
                  type="number"
                  min={1}
                  step={1}
                  value={durationDays}
                  onChange={(event) => setDurationDays(event.target.value)}
                  error={errors.durationDays}
                  hint="Optional"
                />
              </div>
              <Input
                label="Location"
                name="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                error={errors.location}
                hint="Optional venue or meeting place"
              />
              <Textarea
                label="Description"
                name="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                error={errors.description}
              />
              {submitError ? (
                <p className="text-sm text-error" role="alert">
                  {submitError}
                </p>
              ) : null}
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? "Scheduling..." : "Schedule session"}
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

      {updateError ? (
        <p className="mt-6 text-sm text-error" role="alert">
          {updateError}
        </p>
      ) : null}

      <Card
        variant="elevated"
        className={isAdmin ? "mt-8 overflow-hidden" : "overflow-hidden"}
      >
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Upcoming sessions first, then past dates. Update status to cancel or mark complete."
              : "Upcoming sessions first, then past dates."}
          </CardDescription>
        </CardHeader>
        <CardBody className="overflow-x-auto p-0">
          {sessions.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              No training sessions yet.
            </p>
          ) : (
            <table className="table-styled w-full text-sm">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Scheduled</th>
                  <th>Location</th>
                  <th>Duration</th>
                  <th>Status</th>
                  {isAdmin ? <th>Update</th> : null}
                </tr>
              </thead>
              <tbody>
                {sessions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="font-medium text-heading">
                        {item.title}
                      </span>
                      {item.description ? (
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {formatDate(item.scheduledAt)}
                    </td>
                    <td>{item.location ?? "—"}</td>
                    <td>
                      {item.durationDays
                        ? `${item.durationDays} day${item.durationDays === 1 ? "" : "s"}`
                        : "—"}
                    </td>
                    <td>
                      <Badge variant={sessionStatusBadgeVariant(item.status)}>
                        {sessionStatusLabel(item.status)}
                      </Badge>
                    </td>
                    {isAdmin ? (
                      <td>
                        <Select
                          aria-label={`Status for ${item.title}`}
                          value={item.status}
                          disabled={updatingId === item.id}
                          onChange={(event) =>
                            handleStatusChange(
                              item.id,
                              event.target.value as SessionStatus,
                            )
                          }
                          options={SESSION_STATUS_OPTIONS}
                        />
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
