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
import { Textarea } from "@/components/ui/Textarea";

const sessionTypes = [
  {
    title: "Pre-Employment Screening",
    description: "Background verification and integrity assessment for new hires in sensitive roles.",
    icon: "👤",
  },
  {
    title: "Internal Affairs Support",
    description: "Examinations supporting misconduct investigations and disciplinary proceedings.",
    icon: "⚖",
  },
  {
    title: "Periodic Integrity Assessment",
    description: "Scheduled re-examinations for personnel in high-trust positions.",
    icon: "🔄",
  },
  {
    title: "Specific Issue Examination",
    description: "Targeted testing related to a defined allegation or incident.",
    icon: "🎯",
  },
];

const upcomingSessions = [
  { id: "PLG-2026-0033", examinee: "Redacted — Case A", date: "2026-08-22", examiner: "Dr. S. Baptiste" },
  { id: "PLG-2026-0031", examinee: "Redacted — Case B", date: "2026-08-25", examiner: "Dr. S. Baptiste" },
  { id: "PLG-2026-0029", examinee: "Redacted — Case C", date: "2026-08-28", examiner: "M. Joseph" },
];

const protocols = [
  "All sessions conducted in ISO-certified examination rooms",
  "Results encrypted at rest with examiner-only decryption keys",
  "Full audit trail maintained for legal admissibility review",
  "Examinee rights briefing provided prior to every session",
];

export default function PolygraphPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="pattern-diamonds absolute inset-0 opacity-25" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal-light to-brand-orange/25"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="outline-navy" className="mb-4">Specialised Unit</Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            Polygraph & Integrity Testing Unit
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Certified polygraph examiners delivering scientifically validated
            integrity assessments under strict confidentiality and
            chain-of-custody protocols.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/10 px-5 py-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-lg text-white" aria-hidden>◉</span>
            <div>
              <p className="text-sm font-semibold">Certified Examiners</p>
              <p className="text-xs text-white/60">American Polygraph Association standards</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <div className="flex items-center gap-3">
                <div className="section-divider-duo shrink-0" aria-hidden />
                <h2 className="font-heading text-2xl font-bold text-brand-navy">
                  Examination Types
                </h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {sessionTypes.map((type) => (
                  <Card key={type.title} variant="elevated">
                    <CardBody>
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-orange/10 text-xl" aria-hidden>
                        {type.icon}
                      </span>
                      <h3 className="mt-3 font-heading font-semibold text-heading">
                        {type.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold text-brand-navy">
                Scheduled Sessions
              </h2>
              <Card variant="elevated" className="mt-6 overflow-hidden">
                <CardBody className="overflow-x-auto p-0">
                  <table className="table-styled w-full text-sm">
                    <thead>
                      <tr>
                        <th>Session ID</th>
                        <th>Subject</th>
                        <th>Date</th>
                        <th>Examiner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingSessions.map((s) => (
                        <tr key={s.id}>
                          <td className="font-mono text-xs">{s.id}</td>
                          <td>{s.examinee}</td>
                          <td>{s.date}</td>
                          <td>{s.examiner}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>

            <Card variant="callout">
              <CardBody>
                <h3 className="font-heading font-semibold text-heading">
                  Protocol & Confidentiality
                </h3>
                <div className="section-divider-duo mt-2" aria-hidden />
                <ul className="mt-4 space-y-3">
                  {protocols.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white" aria-hidden>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card variant="featured">
              <CardHeader>
                <CardTitle>Request Examination</CardTitle>
                <CardDescription>
                  Submit a booking request for polygraph services.
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Requesting Agency" placeholder="Organisation name" />
                <Select
                  label="Examination Type"
                  placeholder="Select type"
                  options={sessionTypes.map((t) => ({
                    value: t.title.toLowerCase().replace(/\s+/g, "-"),
                    label: t.title,
                  }))}
                />
                <Input label="Preferred Date" type="date" />
                <Textarea
                  label="Purpose & Context"
                  placeholder="Brief description of examination purpose..."
                  rows={3}
                />
                <Button variant="accent" className="w-full">
                  Submit Request
                </Button>
              </CardBody>
            </Card>

            <Card variant="dark">
              <CardBody>
                <p className="font-heading text-xs font-semibold uppercase tracking-wider text-brand-orange">
                  Confidentiality Guarantee
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  All examination results are encrypted and accessible only to
                  authorised examiners. Full chain-of-custody maintained.
                </p>
              </CardBody>
            </Card>

            <Link href="/dashboard" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              View session calendar →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
