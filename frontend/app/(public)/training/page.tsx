import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";

const programmes = [
  {
    id: "TRN-001",
    title: "Forensic Investigation Fundamentals",
    duration: "5 days",
    level: "Foundation",
  },
  {
    id: "TRN-002",
    title: "International Compliance & AML",
    duration: "3 days",
    level: "Intermediate",
  },
  {
    id: "TRN-003",
    title: "Ethics in Public Service",
    duration: "2 days",
    level: "Foundation",
  },
  {
    id: "TRN-004",
    title: "Advanced Digital Forensics",
    duration: "10 days",
    level: "Advanced",
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
        <Image
          src="/training_background.jpeg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-charcoal/65" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/45 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="accent" className="mb-4">Training Division</Badge>
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
        <div className="flex items-center gap-3">
          <div className="section-divider-duo shrink-0" aria-hidden />
          <h2 className="font-heading text-2xl font-bold text-brand-navy">
            Upcoming Programmes
          </h2>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {programmes.map((prog) => (
            <Card key={prog.id} variant="elevated" className="flex flex-col">
              <CardHeader className="border-none">
                <div className="flex items-start justify-between gap-2">
                  <Badge variant="outline">{prog.level}</Badge>
                </div>
                <CardTitle className="mt-3">{prog.title}</CardTitle>
                <CardDescription>{prog.duration}</CardDescription>
                <span className="font-mono text-xs text-muted-foreground">
                  {prog.id}
                </span>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <Card variant="featured" className="lg:col-span-8">
            <CardHeader>
              <CardTitle>Enroll in a Programme</CardTitle>
              <CardDescription>
                Register interest for upcoming training sessions.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <ServiceInquiryForm initialServiceInterest="training" />
            </CardBody>
          </Card>

          <div className="space-y-6 lg:col-span-4">
            <Card variant="callout">
              <CardBody>
                <h3 className="font-heading font-semibold text-heading">
                  Certification
                </h3>
                <div className="section-divider-duo mt-2" aria-hidden />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  All programmes issue LEAF-C certificates aligned with
                  international competency frameworks. CPE credits available
                  for select courses.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant="accent">Accredited</Badge>
                  <Badge variant="muted">CPE Available</Badge>
                </div>
              </CardBody>
            </Card>

            <Link
              href="/signup"
              className="block text-center text-sm font-medium text-brand-orange hover:underline"
            >
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
