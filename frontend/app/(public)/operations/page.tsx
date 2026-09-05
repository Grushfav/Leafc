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
import {
  IconGlobe,
  IconLock,
  IconMonitor,
  IconPulse,
  IconSearch,
  IconUser,
} from "@/components/icons/MonoIcons";

const capabilities = [
  { name: "Field investigations & surveillance", Icon: IconSearch },
  { name: "Digital forensics & evidence recovery", Icon: IconMonitor },
  { name: "Intelligence analysis & reporting", Icon: IconPulse },
  { name: "Witness interview coordination", Icon: IconUser },
  { name: "Cross-jurisdictional liaison", Icon: IconGlobe },
  { name: "Covert operations support", Icon: IconLock },
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
        <Image
          src="/operations_background.jpeg"
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
          <Badge variant="accent" className="mb-4">Operations Division</Badge>
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
              <div className="flex items-center gap-3">
                <div className="section-divider-duo shrink-0" aria-hidden />
                <h2 className="font-heading text-2xl font-bold text-brand-navy">
                  Operational Capabilities
                </h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {capabilities.map((cap) => (
                  <Card key={cap.name} variant="elevated">
                    <CardBody className="flex items-center gap-4">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                        aria-hidden
                      >
                        <cap.Icon className="h-5 w-5" />
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
              <CardBody>
                <ServiceInquiryForm compact initialServiceInterest="operations" />
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

            <Link href="/signup" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
