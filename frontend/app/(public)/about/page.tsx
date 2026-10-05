import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHero } from "@/components/layout/PageHero";
import { ExpertPhotoPlaceholder } from "@/components/experts/ExpertPhotoPlaceholder";
import { ExpertContactLinks } from "@/components/experts/ExpertContactLinks";
import { getPublishedExperts } from "@/lib/experts";
import Link from "next/link";
import { SITE_CONTACT, SITE_EXPANSION } from "@/lib/nav";
import {
  IconBriefcase,
  IconGraduationCap,
  IconPulse,
  IconSearch,
} from "@/components/icons/MonoIcons";

export const metadata: Metadata = {
  title: "About us",
  description:
    "LEAF-C is Law Enforcement Against Financial Crimes. Specialist investigations, compliance, training, and integrity work from Kingston, Jamaica.",
  openGraph: {
    title: "About us | LEAF-C",
    description:
      "Who LEAF-C is, how engagements are scoped, and the divisions behind the work.",
    url: "/about",
    type: "website",
  },
  alternates: {
    canonical: "/about",
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.net";

const howWeWork = [
  {
    title: "Scope",
    body: "We define the scope of each engagement before paid work begins.",
  },
  {
    title: "Assign",
    body: "The right division and expertise are assigned to the issue.",
  },
  {
    title: "Deliver",
    body: "Findings are communicated through clear reports, briefings, or training outcomes.",
  },
];

const divisionCopy = [
  {
    href: "/consultancy",
    title: "Consultancy",
    body: "Advisory, compliance frameworks, risk assessment, and governance support.",
    Icon: IconBriefcase,
  },
  {
    href: "/operations",
    title: "Operations",
    body: "Investigations, intelligence, digital forensics, and verification.",
    Icon: IconSearch,
  },
  {
    href: "/training",
    title: "Training",
    body: "Structured programmes with case work and a LEAF-C certificate.",
    Icon: IconGraduationCap,
  },
  {
    href: "/polygraph",
    title: "Polygraph & Integrity",
    body: "Certified examiners, documented protocol, and confidential reporting.",
    Icon: IconPulse,
  },
] as const;

export default function AboutPage() {
  const experts = getPublishedExperts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About LEAF-C",
    url: new URL("/about", siteUrl).toString(),
    mainEntity: {
      "@type": "ProfessionalService",
      name: "LEAF-C",
      alternateName: SITE_EXPANSION,
      url: siteUrl,
      email: SITE_CONTACT.email,
      telephone: SITE_CONTACT.phoneDisplay,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kingston",
        addressCountry: "JM",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        badge="About us"
        title="Law Enforcement Against Financial Crimes"
        description="LEAF-C provides specialist investigative, compliance, training, and integrity services for organisations that need capability without maintaining every discipline internally."
        imageSrc="/consulting_backgroung.jpeg"
        actions={
          <>
            <Button href="/get-started" variant="accent" size="md">
              Request a consultation
            </Button>
            <Button href="/experts" variant="outline" size="md">
              Our Experts
            </Button>
          </>
        }
      />

      <section className="border-b border-border-subtle bg-warm-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-brand-navy">
            Who we are
          </h2>
          <div className="section-divider-duo mt-4" aria-hidden />
          <div className="mt-6 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            <p>
              LEAF-C (Law Enforcement Against Financial Crimes) brings
              together experience in investigations, financial crime,
              compliance, intelligence, polygraph, digital forensics and
              professional education. The company was established to help
              organizations strengthen prevention, improve investigative
              readiness and make defensible decisions based on reliable
              information.
            </p>
            <p>
              Our work serves organizations that require specialist capability
              without maintaining every discipline internally. Private
              individuals, companies, government agencies, and institutions
              instruct us when a matter needs a defined scope, a named
              discipline, and a record that can later be explained.
            </p>
            <p>
              The practice is organised in four divisions: Consultancy,
              Operations, Training, and Polygraph & Integrity. An engagement
              is led by the unit that fits the issue. Where more than one
              service is required, that is agreed in writing before paid work
              begins. Fees are quoted after intake; there is no published rate
              card.
            </p>
            <p>
              We work to industry standards and professional-services practice
              in governance, compliance, and risk. All engagements include
              encrypted document handling and independent oversight. Inquiries
              are treated as confidential from first contact, including the
              telephone and form, and we respond within two business days.
            </p>
            <p>
              Public office is in Kingston, Jamaica. The Managing Director,
              Adrian Wellington, is an investigations, ethics and compliance
              professional with experience across law enforcement,
              anti-corruption inquiries, corporate investigations, financial
              crime and professional education. He has developed policy,
              training and investigative frameworks for public and private
              sector environments.
            </p>
            <p>
              What we will not do is substitute a shortcut for evidence. A
              polygraph examination, a training course, or an advisory report
              sits inside a wider process. Used well, the work helps an
              organisation decide where to look next and how much confidence
              to place in an account. Used poorly, it will not survive later
              review.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold text-brand-navy">
          How we work
        </h2>
        <div className="section-divider-duo mt-4" aria-hidden />
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The first conversation is a confidential scoping discussion. We use
          it to understand the issue, who needs to be involved, and which
          division should lead. You do not need an account. After intake you
          receive a written proposal covering scope, duration, and
          confidentiality requirements. No paid work starts until that
          proposal is agreed.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {howWeWork.map((item, index) => (
            <Card key={item.title}>
              <CardBody className="px-4 py-4">
                <p className="font-heading text-lg font-bold text-brand-orange/40">
                  0{index + 1}
                </p>
                <h3 className="mt-1 font-heading text-sm font-semibold text-heading">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {item.body}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>

        <h2 className="mt-12 font-heading text-2xl font-bold text-brand-navy">
          Our divisions
        </h2>
        <div className="section-divider-duo mt-4" aria-hidden />
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Four specialist units. Engagements are led by the division that fits
          the issue; more than one can be agreed before work begins.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {divisionCopy.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardBody className="px-4 py-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                    aria-hidden
                  >
                    <item.Icon className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="mt-3 font-heading text-sm font-semibold text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {item.body}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>

        {experts.length > 0 ? (
          <>
            <h2 className="mt-12 font-heading text-2xl font-bold text-brand-navy">
              Leadership
            </h2>
            <div className="section-divider-duo mt-4" aria-hidden />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <article
                  key={expert.slug}
                  className="flex h-full flex-col items-center rounded-2xl bg-surface px-6 py-8 text-center"
                >
                  <ExpertPhotoPlaceholder
                    name={expert.name}
                    portrait={expert.portrait}
                    photoSrc={expert.photoSrc}
                  />
                  <h3 className="mt-5 font-heading text-lg font-bold text-brand-navy">
                    {expert.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-brand-orange">
                    {expert.title}
                  </p>
                  {expert.summary ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                      {expert.summary}
                    </p>
                  ) : null}
                  <ExpertContactLinks expert={expert} className="mt-4" />
                </article>
              ))}
            </div>
            <div className="mt-6">
              <Button href="/experts" variant="outline" size="sm">
                View experts
              </Button>
            </div>
          </>
        ) : null}

        <Card variant="callout" className="mt-12">
          <CardBody>
            <Badge variant="accent" className="mb-3">
              Public office
            </Badge>
            <p className="font-heading text-lg font-semibold text-heading">
              {SITE_EXPANSION}
            </p>
            <address className="mt-3 not-italic text-sm leading-relaxed text-muted-foreground">
              <p>{SITE_CONTACT.location}</p>
              <p className="mt-1">
                <a
                  href={SITE_CONTACT.phoneHref}
                  className="font-medium text-brand-navy underline-offset-2 hover:underline"
                >
                  {SITE_CONTACT.phoneDisplay}
                </a>
                <span aria-hidden> · </span>
                <a
                  href={`mailto:${SITE_CONTACT.email}`}
                  className="font-medium text-brand-navy underline-offset-2 hover:underline"
                >
                  {SITE_CONTACT.email}
                </a>
              </p>
            </address>
            <p className="mt-4 text-sm text-muted-foreground">
              Inquiries are handled confidentially. We respond within two
              business days.
            </p>
            <Button href="/get-started" variant="accent" size="md" className="mt-5">
              Get started
            </Button>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
