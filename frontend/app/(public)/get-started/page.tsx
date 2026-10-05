import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import {
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  IconBriefcase,
  IconGraduationCap,
  IconPulse,
  IconSearch,
} from "@/components/icons/MonoIcons";
import { SITE_CONTACT } from "@/lib/nav";

const steps = [
  {
    title: "Submit inquiry",
    body: "Tell us about your needs, client type, and preferred service division.",
  },
  {
    title: "Initial review",
    body: "Our intake team assesses scope, confidentiality, and jurisdictional fit.",
  },
  {
    title: "Consultation",
    body: "A LEAF-C specialist contacts you to discuss next steps and engagement options.",
  },
];

const services = [
  {
    href: "/consultancy",
    title: "Consultancy",
    body: "Advisory, compliance frameworks, risk assessment, and governance support.",
    Icon: IconBriefcase,
  },
  {
    href: "/operations",
    title: "Investigations",
    body: "Internal and insurance investigations, intelligence, and digital forensics.",
    Icon: IconSearch,
  },
  {
    href: "/training",
    title: "Training",
    body: "Accredited programmes, examiner training, and professional certification.",
    Icon: IconGraduationCap,
  },
  {
    href: "/polygraph",
    title: "Polygraph",
    body: "Integrity screening, specific-issue examinations, and periodic assessment.",
    Icon: IconPulse,
  },
];

export default function GetStartedPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <Image
          src="/get_started_background.jpeg"
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
          <Badge variant="accent" className="mb-4">
            Get Started
          </Badge>
          <h1 className="hero-heading max-w-3xl text-4xl font-bold sm:text-5xl">
            Begin your engagement with LEAF-C
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Whether you need advisory support, investigative operations, accredited
            training, or integrity screening, submit an inquiry and our team will
            guide you through the next steps.
          </p>
        </div>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
          <div className="lg:col-span-7">
            <div className="section-divider-duo" aria-hidden />
            <h2 className="mt-4 font-heading text-2xl font-bold text-brand-navy">
              What happens next
            </h2>
            <ol className="mt-8 space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 font-heading text-sm font-bold text-brand-orange">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-heading">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10">
              <h3 className="font-heading text-lg font-semibold text-heading">
                Getting a consultation
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  The first conversation is a confidential scoping discussion.
                  We use it to understand the issue, who needs to be involved,
                  and which division should lead. You do not need an account.
                </p>
                <p>
                  We define the scope of each engagement, assign appropriate
                  expertise, and communicate findings through clear reports,
                  briefings, or training outcomes. If more than one service is
                  required, that is agreed before work begins.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-heading text-lg font-semibold text-heading">
                Rates and proposals
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  LEAF-C does not publish a fixed rate card. Fees are quoted
                  after the initial review, once scope, duration, location, and
                  confidentiality requirements are clear.
                </p>
                <p>
                  You receive a written proposal before any paid work starts.
                  Sensitive matters can be discussed by telephone if you prefer
                  not to put details in the form.
                </p>
              </div>
            </div>

            <Card variant="callout" className="mt-10">
              <CardBody>
                <p className="font-heading text-sm font-semibold text-heading">
                  Public office
                </p>
                <address className="mt-2 not-italic text-sm leading-relaxed text-muted-foreground">
                  <p>{SITE_CONTACT.location}</p>
                  <p className="mt-1">
                    <a
                      href={SITE_CONTACT.phoneHref}
                      className="font-medium text-brand-navy underline-offset-2 hover:underline"
                    >
                      {SITE_CONTACT.phoneDisplay}
                    </a>
                  </p>
                  <p className="mt-1">
                    <a
                      href={`mailto:${SITE_CONTACT.email}`}
                      className="font-medium text-brand-navy underline-offset-2 hover:underline"
                    >
                      {SITE_CONTACT.email}
                    </a>
                  </p>
                </address>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  All inquiries are handled confidentially. For sensitive matters,
                  note your confidentiality requirements in the message field — our
                  intake team follows strict chain-of-custody protocols from first
                  contact.
                </p>
              </CardBody>
            </Card>

            <p className="mt-6 text-sm text-muted-foreground">
              No account is required. Submit the form and LEAF-C will respond
              within two business days.
            </p>
          </div>

          <Card variant="featured" className="lg:col-span-5">
            <CardHeader className="px-5 py-3">
              <CardTitle className="text-base">Service inquiry form</CardTitle>
              <CardDescription>
                A LEAF-C representative will respond within two business days.
              </CardDescription>
            </CardHeader>
            <CardBody className="px-5 py-4">
              <ServiceInquiryForm compact />
            </CardBody>
          </Card>
        </div>

        <div className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-xl font-bold text-brand-navy">
            Services we can discuss
          </h2>
          <div className="section-divider-duo mt-3" aria-hidden />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Choose a division on the form, or select “Not sure yet” if you want
            guidance. We work with private individuals, companies, government
            agencies, and institutions.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Link key={service.href} href={service.href} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardBody className="px-4 py-3">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                      aria-hidden
                    >
                      <service.Icon className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="mt-3 font-heading text-sm font-semibold text-heading">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">
                      {service.body}
                    </p>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
