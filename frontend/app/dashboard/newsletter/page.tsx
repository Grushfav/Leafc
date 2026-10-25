"use client";

import { useEffect, useMemo, useState } from "react";
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
import { PageLoader } from "@/components/ui/LogoLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import { isAdminRole, isStaffRole, type AuthError } from "@/lib/auth";
import {
  fetchNewsletterSubscribers,
  type NewsletterSubscriber,
} from "@/lib/content";

type StatusFilter = NewsletterSubscriber["status"] | "all";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "subscribed", label: "Subscribed" },
  { id: "pending", label: "Awaiting confirmation" },
  { id: "unsubscribed", label: "Unsubscribed" },
  { id: "all", label: "All" },
];

function formatWhen(value: string | null): string {
  if (!value) return "Not yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet";
  return date.toLocaleString();
}

export default function DashboardNewsletterPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("subscribed");
  const [query, setQuery] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(true);
    fetchNewsletterSubscribers(token)
      .then((rows) => {
        if (cancelled) return;
        setSubscribers(rows);
        setLoadError(null);
      })
      .catch((error: AuthError) => {
        if (cancelled) return;
        setLoadError(error.error ?? "Unable to load newsletter subscribers.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, isAdmin]);

  const counts = useMemo(() => {
    return subscribers.reduce(
      (total, subscriber) => {
        total[subscriber.status] += 1;
        return total;
      },
      { subscribed: 0, pending: 0, unsubscribed: 0 },
    );
  }, [subscribers]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      if (filter !== "all" && subscriber.status !== filter) return false;
      if (!needle) return true;
      return subscriber.email.includes(needle);
    });
  }, [subscribers, filter, query]);

  async function copyEmails(emails: string[], message: string) {
    try {
      await navigator.clipboard.writeText(emails.join("\n"));
      setNotice(message);
    } catch {
      setNotice("Copy failed. Select the address and copy it manually.");
    }
  }

  if (!isReady || !isAdmin) return <PageLoader />;

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-heading">Newsletter</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Confirmed subscribers are the people who can receive a newsletter.
            Copy an address when a message should go to one person, or copy the
            subscribed list when the same note should go to everyone who opted in.
          </p>
        </div>
        <Button
          type="button"
          variant="accent"
          disabled={counts.subscribed === 0}
          onClick={() =>
            copyEmails(
              subscribers
                .filter((subscriber) => subscriber.status === "subscribed")
                .map((subscriber) => subscriber.email),
              `Copied ${counts.subscribed} subscribed email${counts.subscribed === 1 ? "" : "s"}.`,
            )
          }
        >
          Copy subscribed emails
        </Button>
      </div>

      {notice && <p className="mt-4 text-sm text-muted-foreground">{notice}</p>}
      {loadError && (
        <p className="mt-4 text-sm text-error" role="alert">
          {loadError}
        </p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="font-heading text-2xl font-bold text-heading">{counts.subscribed}</p>
            <p className="mt-1 text-xs text-muted-foreground">Subscribed</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-heading text-2xl font-bold text-heading">{counts.pending}</p>
            <p className="mt-1 text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="font-heading text-2xl font-bold text-heading">{counts.unsubscribed}</p>
            <p className="mt-1 text-xs text-muted-foreground">Unsubscribed</p>
          </CardBody>
        </Card>
      </div>

      <Card variant="elevated" className="mt-6 overflow-hidden">
        <CardHeader>
          <CardTitle>Recipients</CardTitle>
          <CardDescription>
            Only subscribed addresses have confirmed they want email. Pending
            signups have not confirmed, and unsubscribed addresses should not be mailed.
          </CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  size="sm"
                  variant={filter === option.id ? "accent" : "outline"}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="min-w-[16rem] flex-1">
              <Input
                label="Find an email"
                value={query}
                placeholder="name@example.com"
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>
        </CardBody>
        <CardBody className="overflow-x-auto p-0">
          {isLoading ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">Loading subscribers…</p>
          ) : visible.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">
              {subscribers.length === 0
                ? "No one has signed up yet."
                : "No addresses match this view."}
            </p>
          ) : (
            <table className="table-styled w-full text-sm">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Signed up</th>
                  <th>Confirmed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="font-medium text-heading">{subscriber.email}</td>
                    <td>
                      <Badge
                        variant={
                          subscriber.status === "subscribed"
                            ? "success"
                            : subscriber.status === "pending"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {subscriber.status === "subscribed"
                          ? "Subscribed"
                          : subscriber.status === "pending"
                            ? "Pending"
                            : "Unsubscribed"}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {formatWhen(subscriber.createdAt)}
                    </td>
                    <td className="whitespace-nowrap text-muted-foreground">
                      {formatWhen(subscriber.confirmedAt)}
                    </td>
                    <td className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          copyEmails([subscriber.email], `Copied ${subscriber.email}.`)
                        }
                      >
                        Copy email
                      </Button>
                    </td>
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
