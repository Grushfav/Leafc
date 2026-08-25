import Link from "next/link";
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

const casePipeline = [
  { id: "INV-2026-0412", title: "Cross-border financial fraud investigation", priority: "High", status: "Active" },
  { id: "INV-2026-0398", title: "Procurement irregularities", priority: "Medium", status: "Active" },
  { id: "INV-2026-0387", title: "Asset tracing — offshore entities", priority: "High", status: "On Hold" },
  { id: "INV-2026-0371", title: "Internal misconduct review", priority: "Low", status: "Closed" },
];

const capabilities = [
  { name: "Field investigations & surveillance", icon: "🎯" },
  { name: "Digital forensics & evidence recovery", icon: "💻" },
  { name: "Intelligence analysis & reporting", icon: "📊" },
  { name: "Witness interview coordination", icon: "🗣" },
  { name: "Cross-jurisdictional liaison", icon: "🌐" },
  { name: "Covert operations support", icon: "🔒" },
];

const processSteps = [
  { step: "Intake", desc: "Case registration and priority assignment" },
  { step: "Investigate", desc: "Field work, forensics, and intelligence" },
  { step: "Report", desc: "Findings compilation and legal review" },
  { step: "Close", desc: "Archival with encrypted chain-of-custody" },
];

export default function OperationsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="pattern-diamonds absolute inset-0 opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-charcoal-light via-charcoal to-brand-orange/20"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="outline-navy" className="mb-4">Operations Division</Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            Investigations & Field Operations
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            End-to-end investigative services with secure case management,
            chain-of-custody tracking, and real-time collaboration.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            {processSteps.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-charcoal">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.step}</p>
                  <p className="text-xs text-white/60">{s.desc}</p>
                </div>
                {i < processSteps.length - 1 && (
                  <span className="ml-2 hidden text-brand-orange sm:inline" aria-hidden>→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="section-divider-duo shrink-0" aria-hidden />
                  <h2 className="font-heading text-2xl font-bold text-brand-navy">
                    Case Pipeline
                  </h2>
                </div>
                <Button variant="accent" size="sm">
                  + New Case
                </Button>
              </div>
              <Card variant="elevated" className="mt-6 overflow-hidden">
                <CardBody className="overflow-x-auto p-0">
                  <table className="table-styled w-full text-sm">
                    <thead>
                      <tr>
                        <th>Case ID</th>
                        <th>Title</th>
                        <th>Priority</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {casePipeline.map((c) => (
                        <tr key={c.id}>
                          <td className="font-mono text-xs">{c.id}</td>
                          <td>{c.title}</td>
                          <td>
                            <Badge
                              variant={
                                c.priority === "High"
                                  ? "accent"
                                  : c.priority === "Medium"
                                    ? "warning"
                                    : "muted"
                              }
                            >
                              {c.priority}
                            </Badge>
                          </td>
                          <td>
                            <Badge
                              variant={
                                c.status === "Active"
                                  ? "success"
                                  : c.status === "On Hold"
                                    ? "warning"
                                    : "muted"
                              }
                            >
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-brand-navy">
                Operational Capabilities
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {capabilities.map((cap) => (
                  <Card key={cap.name} variant="elevated">
                    <CardBody className="flex items-center gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange/10 text-lg" aria-hidden>
                        {cap.icon}
                      </span>
                      <span className="text-sm font-medium">{cap.name}</span>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card variant="featured">
              <CardHeader>
                <CardTitle>Case Intake</CardTitle>
                <CardDescription>
                  Register a new investigation request.
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Case Title" placeholder="Brief case title" />
                <Select
                  label="Priority"
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                    { value: "critical", label: "Critical" },
                  ]}
                />
                <Select
                  label="Jurisdiction"
                  placeholder="Select jurisdiction"
                  options={[
                    { value: "na", label: "North America" },
                    { value: "eu", label: "Europe" },
                    { value: "latam", label: "Latin America" },
                    { value: "multi", label: "Multi-jurisdictional" },
                  ]}
                />
                <Button variant="accent" className="w-full">
                  Submit Case
                </Button>
              </CardBody>
            </Card>

            <Card variant="dark">
              <CardBody>
                <p className="font-heading text-xs font-semibold uppercase tracking-wider text-brand-orange">
                  Secure Operations
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  All cases use encrypted storage, role-based access, and
                  full audit trails. Chain-of-custody maintained for legal
                  admissibility.
                </p>
              </CardBody>
            </Card>

            <Link href="/dashboard" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              View all cases in Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
