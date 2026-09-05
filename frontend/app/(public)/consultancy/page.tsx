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
  IconAlert,
  IconBuilding,
  IconClipboard,
  IconFile,
  IconSearch,
} from "@/components/icons/MonoIcons";

const services = [
  { name: "Compliance framework design & gap analysis", Icon: IconClipboard },
  { name: "Governance audits & board advisory", Icon: IconBuilding },
  { name: "Risk assessment & mitigation planning", Icon: IconAlert },
  { name: "Policy development & regulatory mapping", Icon: IconFile },
  { name: "Due diligence & integrity reviews", Icon: IconSearch },
];

const processSteps = [
  { step: "01", title: "Discovery", desc: "Initial scoping and stakeholder interviews" },
  { step: "02", title: "Assessment", desc: "Gap analysis against regulatory frameworks" },
  { step: "03", title: "Advisory", desc: "Recommendations and implementation roadmap" },
  { step: "04", title: "Review", desc: "Ongoing monitoring and compliance validation" },
];

export default function ConsultancyPage() {
  return (
    <>
      {/* Division Hero — charcoal + orange accent */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <div className="pattern-grid absolute inset-0 opacity-30" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-br from-charcoal via-charcoal-light to-brand-orange/25"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Badge variant="outline-navy" className="mb-4 animate-fade-in-up">
            Consultancy Division
          </Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl animate-fade-in-up animate-delay-1">
            Strategic Advisory & Compliance
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 animate-fade-in-up animate-delay-2">
            Expert guidance on governance, regulatory compliance, and
            organisational integrity for public and private sector institutions.
          </p>
        </div>
      </section>

      {/* Process timeline */}
      <section className="border-b border-border-subtle bg-warm-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-lg font-semibold text-heading">Our Advisory Process</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((s) => (
              <div key={s.step} className="relative rounded-xl border border-border-subtle bg-surface p-5 hover-lift">
                <span className="font-heading text-3xl font-bold text-brand-orange/30">{s.step}</span>
                <h3 className="mt-2 font-heading font-semibold text-heading">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
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
                Core Services
              </h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {services.map((service) => (
                <Card key={service.name} variant="elevated">
                  <CardBody className="flex items-start gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                      aria-hidden
                    >
                      <service.Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium leading-relaxed">{service.name}</span>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card variant="featured">
              <CardHeader>
                <CardTitle>Request Advisory</CardTitle>
                <CardDescription>
                  Submit an initial inquiry for consultancy services.
                </CardDescription>
              </CardHeader>
              <CardBody>
                <ServiceInquiryForm compact initialServiceInterest="consultancy" />
              </CardBody>
            </Card>

            <Card variant="callout">
              <CardBody>
                <Badge variant="accent" className="mb-3">Why LEAF-C</Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Our advisory team combines UWI academic rigour with decades of
                  global governance experience. All engagements include encrypted
                  document handling and independent oversight.
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
