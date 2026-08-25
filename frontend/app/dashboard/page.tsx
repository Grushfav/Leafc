import { SiteHeader } from "@/components/layout/SiteHeader";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";

const kpis = [
  { label: "Active Investigations", value: "24", change: "+3 this week", accent: "kpi-accent-orange" as const, badge: "accent" as const },
  { label: "Open Reports", value: "7", change: "2 due today", accent: "kpi-accent-gold" as const, badge: "warning" as const },
  { label: "Training Enrollments", value: "156", change: "+12 this month", accent: "kpi-accent-charcoal" as const, badge: "accent" as const },
  { label: "Polygraph Sessions", value: "8", change: "3 scheduled", accent: "kpi-accent-navy" as const, badge: "muted" as const },
];

const quickActions = [
  { label: "New Investigation", division: "Operations", icon: "⚙" },
  { label: "Generate Report", division: "Consultancy", icon: "📋" },
  { label: "Schedule Training", division: "Training", icon: "▣" },
  { label: "Book Examination", division: "Polygraph", icon: "◉" },
];

const activityFeed = [
  { time: "14:32", user: "J. Mitchell", action: "Case updated", resource: "INV-2026-0412", type: "update" },
  { time: "13:15", user: "A. Williams", action: "Report submitted", resource: "RPT-2026-0089", type: "submit" },
  { time: "11:48", user: "System", action: "Document encrypted", resource: "DOC-2026-1204", type: "system" },
  { time: "09:22", user: "R. Clarke", action: "Session scheduled", resource: "PLG-2026-0033", type: "schedule" },
];

const activityIcons: Record<string, string> = {
  update: "✏",
  submit: "📤",
  system: "🔒",
  schedule: "📅",
};

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />
      <DashboardShell
        title="Dashboard"
        description="Overview of cases, reports, and division activity."
      >
        {/* KPI Cards — colored accents, not all navy */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} variant="kpi" className={kpi.accent}>
              <CardBody>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="mt-1 font-heading text-3xl font-bold text-heading">
                  {kpi.value}
                </p>
                <Badge variant={kpi.badge} className="mt-3">
                  {kpi.change}
                </Badge>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Quick Actions — hover lift tiles */}
        <div className="mt-8">
          <div className="flex items-center gap-3">
            <div className="section-divider-duo shrink-0" aria-hidden />
            <h2 className="font-heading text-lg font-semibold text-brand-navy">
              Quick Actions
            </h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="group flex flex-col items-start gap-2 rounded-xl border border-border-subtle bg-surface p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-orange/30 hover:shadow-card"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 text-lg transition-colors group-hover:bg-brand-orange group-hover:text-white">
                  {action.icon}
                </span>
                <span className="font-heading font-semibold text-heading">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.division}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Case Activity</CardTitle>
              <CardDescription>
                Investigations opened vs. closed — last 90 days
              </CardDescription>
            </CardHeader>
            <CardBody>
              <div
                className="flex h-52 items-end justify-around gap-1.5 rounded-xl bg-warm-cream p-4 sm:gap-2"
                role="img"
                aria-label="Bar chart showing case activity trends over 12 periods"
              >
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 50, 85, 68].map(
                  (h, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-brand-orange-dark via-brand-orange to-brand-gold transition-all duration-300 hover:brightness-110"
                        style={{ height: `${h}%` }}
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted-foreground">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Division Workload</CardTitle>
              <CardDescription>Active items by division</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="space-y-5">
                {[
                  { name: "Operations", pct: 42, color: "from-brand-orange to-brand-gold" },
                  { name: "Consultancy", pct: 28, color: "from-brand-orange-dark to-brand-orange" },
                  { name: "Training", pct: 18, color: "from-brand-gold to-brand-orange-light" },
                  { name: "Polygraph", pct: 12, color: "from-charcoal-muted to-charcoal-light" },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-heading">{item.name}</span>
                      <span className="font-heading font-semibold text-brand-orange">{item.pct}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-warm-cream">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Activity feed + table */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card variant="elevated" className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Live Activity</CardTitle>
              <CardDescription>Recent events</CardDescription>
            </CardHeader>
            <CardBody className="space-y-4">
              {activityFeed.map((item) => (
                <div
                  key={item.resource}
                  className="flex items-start gap-3 rounded-lg border border-border-subtle bg-warm-white p-3 transition-colors hover:border-brand-orange/20"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-sm">
                    {activityIcons[item.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-heading">{item.action}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{item.resource}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.user} · {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card variant="elevated" className="overflow-hidden lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity Log</CardTitle>
              <CardDescription>Latest audit log entries</CardDescription>
            </CardHeader>
            <CardBody className="overflow-x-auto p-0">
              <table className="table-styled w-full text-sm">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Resource</th>
                  </tr>
                </thead>
                <tbody>
                  {activityFeed.map((item) => (
                    <tr key={item.resource}>
                      <td className="text-muted-foreground">2026-08-19 {item.time}</td>
                      <td>{item.user}</td>
                      <td>{item.action}</td>
                      <td className="font-mono text-xs">{item.resource}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      </DashboardShell>
    </>
  );
}
