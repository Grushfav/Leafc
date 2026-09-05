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
  IconPulse,
  IconScale,
  IconSearch,
  IconUser,
} from "@/components/icons/MonoIcons";

const sessionTypes = [
  {
    title: "Pre-Employment Screening",
    description: "Background verification and integrity assessment for new hires in sensitive roles.",
    Icon: IconUser,
  },
  {
    title: "Internal Affairs Support",
    description: "Examinations supporting misconduct investigations and disciplinary proceedings.",
    Icon: IconScale,
  },
  {
    title: "Periodic Integrity Assessment",
    description: "Scheduled re-examinations for personnel in high-trust positions.",
    Icon: IconPulse,
  },
  {
    title: "Specific Issue Examination",
    description: "Targeted testing related to a defined allegation or incident.",
    Icon: IconSearch,
  },
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
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-brand-navy text-white" aria-hidden>
              <IconScale className="h-5 w-5" />
            </span>
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
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                        aria-hidden
                      >
                        <type.Icon className="h-5 w-5" />
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
              <CardBody>
                <ServiceInquiryForm compact initialServiceInterest="polygraph" />
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

            <Link href="/signup" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              Create an account →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
