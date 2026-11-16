"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { OverviewIdentity } from "@/components/dashboard/OverviewIdentity";
import {
  KpiCallout,
  KpiMetric,
  OverviewKpiGrid,
} from "@/components/dashboard/OverviewKpi";
import {
  formatCompactDate,
  formatSessionWhen,
  inquiryStatusBadgeVariant,
  inquiryStatusLabel,
  serviceInterestLabel,
} from "@/components/dashboard/format";
import {
  InquiryQueueRow,
  SessionQueueRow,
  WorkQueue,
} from "@/components/dashboard/WorkQueue";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/LogoLoader";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  fetchDashboardSummary,
  fetchInquiries,
  isStaffRole,
  type AuthError,
  type DashboardSummary,
  type InquiryRecord,
} from "@/lib/auth";
import {
  fetchTrainingSessions,
  sessionStatusBadgeVariant,
  sessionStatusLabel,
  type TrainingSession,
} from "@/lib/training";

const SNAPSHOT_LIMIT = 5;

interface SessionSnapshotRow {
  session: TrainingSession;
  isPast: boolean;
}

function selectTrainingSnapshot(sessions: TrainingSession[]): SessionSnapshotRow[] {
  const now = Date.now();
  const upcoming = sessions
    .filter(
      (item) =>
        item.status === "scheduled" &&
        new Date(item.scheduledAt).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )
    .slice(0, SNAPSHOT_LIMIT)
    .map((session) => ({ session, isPast: false }));

  if (upcoming.length > 0) return upcoming;

  return [...sessions]
    .sort((a, b) => {
      const aPast = new Date(a.scheduledAt).getTime() < now;
      const bPast = new Date(b.scheduledAt).getTime() < now;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return (
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
    })
    .slice(0, SNAPSHOT_LIMIT)
    .map((session) => ({
      session,
      isPast: new Date(session.scheduledAt).getTime() < now,
    }));
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, isReady } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [inquiries, setInquiries] = useState<InquiryRecord[] | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!user || !token || !isStaffRole(user.role)) {
      router.replace("/login");
    }
  }, [isReady, user, token, router]);

  useEffect(() => {
    if (!token || !user) return;

    const staff = isStaffRole(user.role);
    const request = staff
      ? Promise.all([
          fetchDashboardSummary(token),
          fetchInquiries(token),
          fetchTrainingSessions(token),
        ]).then(([nextSummary, nextInquiries, nextSessions]) => {
          setSummary(nextSummary);
          setInquiries(nextInquiries);
          setSessions(nextSessions);
        })
      : Promise.all([fetchDashboardSummary(token), fetchInquiries(token)]).then(
          ([nextSummary, nextInquiries]) => {
            setSummary(nextSummary);
            setInquiries(nextInquiries);
          },
        );

    request.catch((error: AuthError) => {
      setLoadError(error.error ?? "Unable to load workspace data.");
      setInquiries((current) => current ?? []);
      if (staff) {
        setSessions((current) => current ?? []);
      }
    });
  }, [token, user]);

  useEffect(() => {
    if (inquiries === null) return;
    if (window.location.hash !== "#incoming-inquiries") return;
    document
      .getElementById("incoming-inquiries")
      ?.scrollIntoView({ behavior: "smooth" });
  }, [inquiries]);

  const trainingSnapshot = useMemo(
    () => (sessions ? selectTrainingSnapshot(sessions) : []),
    [sessions],
  );
  const inquiryRows = useMemo(
    () =>
      [...(inquiries ?? [])].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [inquiries],
  );

  if (!isReady || !user) {
    return <PageLoader label="Loading workspace…" />;
  }

  const staff = isStaffRole(user.role);

  const primaryAction = staff
    ? undefined
    : {
        href: "/get-started",
        label: "Request services",
      };

  return (
    <DashboardShell
      title={staff ? "Overview" : "Your workspace"}
      description={
        staff
          ? "Training and incoming intake."
          : "Your LEAF-C requests and account details."
      }
      toolbar={<OverviewIdentity user={user} primaryAction={primaryAction} />}
    >
      <div className="space-y-6">
        {summary ? (
          <OverviewKpiGrid
            className={
              staff ? "xl:grid-cols-3" : "xl:max-w-3xl xl:grid-cols-2"
            }
          >
            {staff ? (
              <>
                <KpiMetric
                  featured
                  accent="gold"
                  label="New inquiries"
                  value={summary.newInquiries ?? 0}
                  hint="Awaiting first review"
                  href="#incoming-inquiries"
                />
                <KpiMetric
                  accent="charcoal"
                  label="LEAF-C members"
                  value={summary.members ?? 0}
                  hint="Registered staff"
                />
                <KpiMetric
                  accent="navy"
                  label="Training sessions"
                  value={summary.trainingSessions ?? 0}
                  hint="On the calendar"
                  href="/dashboard/training"
                />
              </>
            ) : (
              <>
                <KpiMetric
                  featured
                  accent="orange"
                  label="Your inquiries"
                  value={summary.inquiries}
                  hint="Submitted with this account"
                  href="#incoming-inquiries"
                />
                <KpiCallout
                  label="Next step"
                  href="/get-started"
                  hrefLabel="Request services"
                >
                  Submit a service inquiry to start an engagement.
                </KpiCallout>
              </>
            )}
          </OverviewKpiGrid>
        ) : null}

        {loadError ? (
          <p className="text-sm text-error" role="alert">
            {loadError}
          </p>
        ) : null}

        {staff ? (
          <WorkQueue
            eyebrow="Command center"
            title="Training"
            description="Upcoming scheduled sessions, then recent dates."
            viewAllHref="/dashboard/training"
            loading={sessions === null}
            loadingLabel="Loading sessions…"
            empty={
              sessions !== null && trainingSnapshot.length === 0
                ? {
                    message: "No upcoming sessions.",
                    actionHref: "/dashboard/training",
                    actionLabel: "View the training calendar",
                  }
                : null
            }
          >
            {trainingSnapshot.map(({ session, isPast }) => (
              <SessionQueueRow
                key={session.id}
                title={session.title}
                meta={[
                  formatSessionWhen(session.scheduledAt),
                  session.location,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                status={
                  <>
                    {isPast ? <Badge variant="muted">Past</Badge> : null}
                    <Badge variant={sessionStatusBadgeVariant(session.status)}>
                      {sessionStatusLabel(session.status)}
                    </Badge>
                  </>
                }
              />
            ))}
          </WorkQueue>
        ) : null}

        <WorkQueue
          id="incoming-inquiries"
          eyebrow={staff ? "Intake" : "Requests"}
          title={staff ? "Incoming inquiries" : "Your inquiries"}
          description={
            staff
              ? "Live submissions from the public intake form."
              : "Requests submitted with this account email."
          }
          loading={inquiries === null}
          loadingLabel="Loading inquiries…"
          empty={
            inquiries !== null && inquiryRows.length === 0
              ? {
                  message: staff
                    ? "No incoming inquiries."
                    : "No inquiries yet.",
                  actionHref: staff ? undefined : "/get-started",
                  actionLabel: staff ? undefined : "Request services",
                }
              : null
          }
          columns={
            staff
              ? ["Reference", "Contact", "Service", "Status", "Submitted"]
              : ["Reference", "Name", "Service", "Status", "Submitted"]
          }
          columnClassName="grid-cols-[7.25rem_minmax(0,1.1fr)_minmax(0,1fr)_auto_6.5rem]"
        >
          {inquiryRows.map((item) => (
            <InquiryQueueRow
              key={item.id}
              reference={item.referenceNumber}
              title={item.fullName}
              email={item.email}
              phone={item.phone}
              meta={serviceInterestLabel(item.serviceInterest)}
              status={
                <Badge variant={inquiryStatusBadgeVariant(item.status)}>
                  {inquiryStatusLabel(item.status)}
                </Badge>
              }
              date={formatCompactDate(item.createdAt)}
            />
          ))}
        </WorkQueue>
      </div>
    </DashboardShell>
  );
}
