import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const programmes = [
  {
    id: "TRN-001",
    title: "Forensic Investigation Fundamentals",
    duration: "5 days",
    seats: "12 / 20",
    level: "Foundation",
    icon: "🔬",
  },
  {
    id: "TRN-002",
    title: "International Compliance & AML",
    duration: "3 days",
    seats: "18 / 25",
    level: "Intermediate",
    icon: "📋",
  },
  {
    id: "TRN-003",
    title: "Ethics in Public Service",
    duration: "2 days",
    seats: "8 / 15",
    level: "Foundation",
    icon: "⚖",
  },
  {
    id: "TRN-004",
    title: "Advanced Digital Forensics",
    duration: "10 days",
    seats: "6 / 10",
    level: "Advanced",
    icon: "💻",
  },
];

const features = [
  "LEAF-C accredited certificates",
  "CPE credits for select courses",
  "Industry competency frameworks",
  "Hands-on case simulations",
];

export default function TrainingPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div
          className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-brand-orange/30"
          aria-hidden
        />
        <div className="pattern-dots absolute inset-0 opacity-20" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="outline-navy" className="mb-4">Training Division</Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            Professional Development Programmes
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Accredited training in investigative methodology, forensic science,
            and international regulatory compliance — building professional capacity.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {features.map((f) => (
              <div key={f} className="rounded-lg border border-brand-navy/25 bg-brand-navy/10 px-3 py-2 text-center text-xs backdrop-blur-sm">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="section-divider-duo shrink-0" aria-hidden />
              <h2 className="font-heading text-2xl font-bold text-brand-navy">
                Upcoming Programmes
              </h2>
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {programmes.map((prog) => {
                const [filled, total] = prog.seats.split(" / ").map(Number);
                const pct = (filled / total) * 100;
                return (
                  <Card key={prog.id} variant="elevated" className="flex flex-col">
                    <CardHeader className="border-none pb-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-orange/10 text-2xl" aria-hidden>
                          {prog.icon}
                        </span>
                        <Badge variant="outline">{prog.level}</Badge>
                      </div>
                      <CardTitle className="mt-3">{prog.title}</CardTitle>
                      <CardDescription>
                        {prog.duration} · {prog.seats} seats filled
                      </CardDescription>
                      <span className="font-mono text-xs text-muted-foreground">{prog.id}</span>
                    </CardHeader>
                    <CardFooter className="mt-auto border-none">
                      <div className="w-full">
                        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                          <span>Enrollment</span>
                          <span>{Math.round(pct)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-warm-cream">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-gold transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <Card variant="featured">
              <CardHeader>
                <CardTitle>Enroll in a Programme</CardTitle>
                <CardDescription>
                  Register interest for upcoming training sessions.
                </CardDescription>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input label="Full Name" placeholder="Participant name" />
                <Input label="Organisation" placeholder="Employer / agency" />
                <Select
                  label="Programme"
                  placeholder="Select programme"
                  options={programmes.map((p) => ({
                    value: p.id,
                    label: p.title,
                  }))}
                />
                <Button variant="accent" className="w-full">
                  Submit Enrollment
                </Button>
              </CardBody>
            </Card>

            <Card variant="callout">
              <CardBody>
                <h3 className="font-heading font-semibold text-heading">
                  Certification
                </h3>
                <div className="section-divider-duo mt-2" aria-hidden />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  All programmes issue LEAF-C certificates aligned with international
                  competency frameworks. CPE credits available for select courses.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="accent">Accredited</Badge>
                  <Badge variant="muted">CPE Available</Badge>
                </div>
              </CardBody>
            </Card>

            <Link href="/dashboard" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              Manage enrollments →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
