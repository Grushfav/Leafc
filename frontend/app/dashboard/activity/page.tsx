"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useToast } from "@/components/ui/Toast";
import { fetchActivityLog, type ActivityEvent } from "@/lib/cms/api";
import { isAdminRole, isStaffRole, type AuthError } from "@/lib/auth";

function formatWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function actionLabel(action: string): string {
  switch (action) {
    case "login":
      return "Signed in";
    case "permissions.update":
      return "Updated permissions";
    case "cms.page.save":
      return "Saved page draft";
    case "cms.page.publish":
      return "Published page";
    case "cms.global.save":
      return "Saved site setting";
    case "cms.global.publish":
      return "Published site setting";
    case "cms.expert.create":
      return "Created expert";
    case "cms.expert.update":
      return "Updated expert";
    case "cms.expert.delete":
      return "Deleted expert";
    case "cms.experts.publish":
      return "Published experts";
    case "insight.create":
      return "Created insight";
    case "insight.update":
      return "Updated insight";
    case "insight.delete":
      return "Deleted insight";
    case "academy.course.create":
      return "Created academy course";
    case "academy.course.update":
      return "Updated academy course";
    case "academy.course.delete":
      return "Deleted academy course";
    case "division.save":
      return "Saved division page";
    default:
      return action;
  }
}

export default function ActivityPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const { pushToast } = useToast();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "login" | "changes">("all");

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
    setLoading(true);
    const action = filter === "login" ? "login" : undefined;
    fetchActivityLog(token, { limit: 150, action })
      .then((data) => {
        if (cancelled) return;
        const rows =
          filter === "changes"
            ? data.events.filter((event) => event.action !== "login")
            : data.events;
        setEvents(rows);
      })
      .catch((error: AuthError) => {
        if (!cancelled) {
          pushToast(error.error ?? "Unable to load activity.", "error");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin, filter, pushToast]);

  if (!isReady || !isAdmin) {
    return <PageLoader label="Loading activity…" />;
  }

  return (
    <DashboardShell
      title="Activity"
      description="Logins and content changes across the workspace."
    >
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Includes successful sign-ins and audited content or permission changes.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="mb-4 flex flex-wrap gap-2">
            {(
              [
                ["all", "All"],
                ["login", "Logins"],
                ["changes", "Changes"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={
                  filter === id
                    ? "rounded-full bg-brand-navy px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded-full bg-warm-cream px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-orange/15"
                }
              >
                {label}
              </button>
            ))}
          </div>

          {loading ? (
            <PageLoader label="Loading…" />
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border-subtle text-muted-foreground">
                    <th className="px-3 py-2 font-medium">When</th>
                    <th className="px-3 py-2 font-medium">Who</th>
                    <th className="px-3 py-2 font-medium">Action</th>
                    <th className="px-3 py-2 font-medium">Target</th>
                    <th className="px-3 py-2 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="border-b border-border-subtle/70">
                      <td className="px-3 py-3 whitespace-nowrap">
                        {formatWhen(event.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium text-brand-navy">
                          {event.userName ?? "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {event.userEmail ?? "—"}
                        </div>
                      </td>
                      <td className="px-3 py-3">{actionLabel(event.action)}</td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {event.resourceType}
                        {event.resourceId ? ` · ${event.resourceId}` : ""}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {event.ipAddress ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardShell>
  );
}
