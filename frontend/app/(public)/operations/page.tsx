import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { CollapsibleInquiry } from "@/components/forms/CollapsibleInquiry";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";

const capabilities = [
  "Field investigations & surveillance",
  "Digital forensics & evidence recovery",
  "Intelligence analysis & reporting",
  "Witness interview coordination",
  "Cross-jurisdictional liaison",
  "Covert operations support",
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
        <div className="flex items-center gap-3">
          <div className="section-divider-duo shrink-0" aria-hidden />
          <h2 className="font-heading text-2xl font-bold text-brand-navy">
            Operational Capabilities
          </h2>
        </div>
        <div className="mt-5 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          <p>
            Our Operations Division delivers specialized investigative and
            compliance services designed to protect organizations from internal
            and external threats. We conduct insurance and corporate
            investigations, deploy intelligence and surveillance capabilities,
            and apply advanced digital forensics to uncover critical evidence.
            Each assignment is executed with precision, leveraging
            technology-driven methodologies to ensure accuracy, reliability,
            and confidentiality.
          </p>
          <p>
            Beyond investigations, the division provides verification services
            such as background checks and integrity assessments, enabling
            clients to make informed decisions with confidence. Our operational
            teams are trained to respond swiftly in high-risk environments,
            maintaining strict chain-of-custody protocols and evidentiary
            standards. Whether supporting corporations, financial institutions,
            or government agencies, the Operations Division ensures that every
            engagement strengthens organizational resilience and safeguards
            reputational trust.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {capabilities.map((name) => (
            <Card key={name} variant="elevated">
              <CardBody className="py-4">
                <span className="text-sm font-medium">{name}</span>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <CollapsibleInquiry
            title="Case Intake"
            description="Register a new investigation request."
            className="lg:col-span-8"
          >
            <ServiceInquiryForm initialServiceInterest="operations" />
          </CollapsibleInquiry>

          <div className="space-y-6 lg:col-span-4">
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
