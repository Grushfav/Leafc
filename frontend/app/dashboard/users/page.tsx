"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/ui/LogoLoader";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toast";
import {
  cancelAdminInvite,
  fetchAdminUsers,
  inviteAdminUser,
  resendAdminInvite,
  updateUserPermissions,
  type AdminUserRecord,
} from "@/lib/cms/api";
import {
  CONTENT_PERMISSION_KEYS,
  CONTENT_PERMISSION_LABELS,
  emptyPermissions,
  isAdminRole,
  isStaffRole,
  roleLabel,
  type AccountRole,
  type AuthError,
  type ContentPermissionKey,
} from "@/lib/auth";

const INVITE_ROLE_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "senior_agent", label: "Senior agent" },
  { value: "admin", label: "Admin" },
] as const;

type InviteRole = (typeof INVITE_ROLE_OPTIONS)[number]["value"];

function formatWhen(value: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleString();
}

export default function UsersPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const { pushToast } = useToast();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("agent");
  const [inviteSubmitting, setInviteSubmitting] = useState(false);

  const isAdmin = Boolean(user && isAdminRole(user.role));

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
      return;
    }
    if (!isAdminRole(user.role)) {
      router.replace("/dashboard");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !isAdmin) return;
    let cancelled = false;
    fetchAdminUsers(token)
      .then((data) => {
        if (!cancelled) setUsers(data.users);
      })
      .catch((error: AuthError) => {
        if (!cancelled) {
          pushToast(error.error ?? "Unable to load users.", "error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin, pushToast]);

  async function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || inviteSubmitting) return;
    setInviteSubmitting(true);
    try {
      const result = await inviteAdminUser(token, {
        name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      setUsers((current) => {
        const without = current.filter((item) => item.id !== result.user.id);
        return [result.user, ...without];
      });
      setInviteName("");
      setInviteEmail("");
      setInviteRole("agent");
      pushToast(`Invite sent to ${result.user.email}.`);
    } catch (error) {
      pushToast(
        (error as AuthError).error ?? "Unable to send invite.",
        "error",
      );
    } finally {
      setInviteSubmitting(false);
    }
  }

  async function handleResendInvite(row: AdminUserRecord) {
    if (!token) return;
    const busy = `resend:${row.id}`;
    setBusyKey(busy);
    try {
      const updated = await resendAdminInvite(token, row.id);
      setUsers((current) =>
        current.map((item) => (item.id === row.id ? updated.user : item)),
      );
      pushToast(`Invite resent to ${row.email}.`);
    } catch (error) {
      pushToast(
        (error as AuthError).error ?? "Unable to resend invite.",
        "error",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function handleCancelInvite(row: AdminUserRecord) {
    if (!token) return;
    const confirmed = window.confirm(
      `Cancel the pending invite for ${row.email}?`,
    );
    if (!confirmed) return;
    const busy = `cancel:${row.id}`;
    setBusyKey(busy);
    try {
      await cancelAdminInvite(token, row.id);
      setUsers((current) => current.filter((item) => item.id !== row.id));
      pushToast(`Invite for ${row.email} cancelled.`);
    } catch (error) {
      pushToast(
        (error as AuthError).error ?? "Unable to cancel invite.",
        "error",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function togglePermission(
    row: AdminUserRecord,
    key: ContentPermissionKey,
    enabled: boolean,
  ) {
    if (!token) return;
    const busy = `${row.id}:${key}`;
    setBusyKey(busy);
    try {
      const updated = await updateUserPermissions(token, row.id, { [key]: enabled });
      setUsers((current) =>
        current.map((item) => (item.id === row.id ? updated.user : item)),
      );
      pushToast(
        `${CONTENT_PERMISSION_LABELS[key]} ${enabled ? "granted" : "revoked"} for ${row.name}.`,
      );
    } catch (error) {
      pushToast(
        (error as AuthError).error ?? "Unable to update access.",
        "error",
      );
    } finally {
      setBusyKey(null);
    }
  }

  if (!isReady || !isAdmin) {
    return <PageLoader label="Loading users…" />;
  }

  return (
    <DashboardShell
      title="Users"
      description="Grant content permissions per person. Admins always have full access."
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invite staff</CardTitle>
            <CardDescription>
              Send a personal invite link. Content permissions are set after they join.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <form onSubmit={(event) => void handleInvite(event)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  name="inviteName"
                  required
                  value={inviteName}
                  onChange={(event) => setInviteName(event.target.value)}
                  disabled={inviteSubmitting}
                />
                <Input
                  label="Email"
                  name="inviteEmail"
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                  disabled={inviteSubmitting}
                />
              </div>
              <Select
                label="Role"
                name="inviteRole"
                value={inviteRole}
                onChange={(event) =>
                  setInviteRole(event.target.value as InviteRole)
                }
                options={[...INVITE_ROLE_OPTIONS]}
                disabled={inviteSubmitting}
              />
              <Button type="submit" disabled={inviteSubmitting}>
                {inviteSubmitting ? "Sending…" : "Send invite"}
              </Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff access</CardTitle>
            <CardDescription>
              Toggle each capability separately. Last login is shown for each account.
            </CardDescription>
          </CardHeader>
          <CardBody>
            {loading ? (
              <PageLoader label="Loading…" />
            ) : (
              <div className="space-y-6">
                {users.map((row) => {
                  const perms = row.permissions ?? emptyPermissions();
                  const isPending = row.inviteStatus === "pending";
                  const resendBusy = busyKey === `resend:${row.id}`;
                  const cancelBusy = busyKey === `cancel:${row.id}`;
                  return (
                    <div
                      key={row.id}
                      className="rounded-xl border border-border-subtle bg-warm-cream/40 p-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-heading text-base font-semibold text-brand-navy">
                            {row.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{row.email}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {roleLabel(row.role as AccountRole)}
                            {" · "}
                            {isPending
                              ? `Invite expires ${formatWhen(row.inviteExpiresAt)}`
                              : `Last login ${formatWhen(row.lastLoginAt)}`}
                          </p>
                        </div>
                        {isPending ? (
                          <span className="text-xs font-medium text-amber-800">
                            Pending invite
                          </span>
                        ) : !row.isActive ? (
                          <span className="text-xs font-medium text-red-700">Inactive</span>
                        ) : null}
                      </div>

                      {isPending ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={resendBusy || cancelBusy}
                            onClick={() => void handleResendInvite(row)}
                          >
                            {resendBusy ? "Resending…" : "Resend"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={resendBusy || cancelBusy}
                            onClick={() => void handleCancelInvite(row)}
                          >
                            {cancelBusy ? "Cancelling…" : "Cancel"}
                          </Button>
                        </div>
                      ) : row.role === "admin" ? (
                        <p className="mt-3 text-sm text-muted-foreground">
                          Full access (admin).
                        </p>
                      ) : (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {CONTENT_PERMISSION_KEYS.map((key) => {
                            const busy = busyKey === `${row.id}:${key}`;
                            return (
                              <label
                                key={key}
                                className="flex items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  className="mt-0.5"
                                  checked={perms[key]}
                                  disabled={busy}
                                  onChange={(event) =>
                                    void togglePermission(row, key, event.target.checked)
                                  }
                                />
                                <span>{CONTENT_PERMISSION_LABELS[key]}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardShell>
  );
}
