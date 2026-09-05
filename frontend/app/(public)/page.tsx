import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HomeHero } from "@/components/layout/HomeHero";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import { Card } from "@/components/ui/Card";
import { IconBriefcase, IconGlobe, IconGraduationCap, IconLock, IconPulse, IconScale, IconSearch } from "@/components/icons/MonoIcons";
import { cn } from "@/lib/utils";

const services = [
  {
    title: "Consultancy",
    href: "/consultancy",
    badge: "Advisory",
    image: "/services-consulting.jpeg",
    imageAlt: "Professional consultants in a partnership meeting",
    accent: "navy" as const,
    Icon: IconBriefcase,
    items: [
      "Anti-fraud and compliance frameworks",
      "Risk assessments and audits",
      "Policy advisory and governance support",
      "Due diligence and whistleblower systems",
    ],
  },
  {
    title: "Investigations",
    href: "/operations",
    badge: "Operations",
    image: "/services-investigation.jpeg",
    imageAlt: "Investigator reviewing evidence and intelligence in an operations center",
    accent: "orange" as const,
    Icon: IconSearch,
    items: [
      "Internal and insurance investigations",
      "Intelligence and surveillance",
      "Digital forensics and data analysis",
      "Background checks and verification",
    ],
  },
  {
    title: "Training",
    href: "/training",
    badge: "Capacity Building",
    image: "/services-training.jpeg",
    imageAlt: "Professional training session with instructors and participants",
    accent: "bronze" as const,
    Icon: IconGraduationCap,
    items: [
      "Certified professional training programs",
      "Polygraph examiner training",
      "Digital forensics courses",
      "Regional academic partnerships",
    ],
  },
];

const serviceAccentStyles = {
  navy: {
    bar: "from-brand-navy via-brand-navy-light to-brand-orange",
    panel: "from-brand-navy/[0.06] to-warm-cream",
    icon: "border-brand-navy/20 bg-brand-navy/10 text-brand-navy",
    check: "bg-brand-navy",
    row: "hover:border-brand-navy/20 hover:bg-brand-navy/[0.04]",
  },
  orange: {
    bar: "from-brand-orange via-brand-gold to-brand-orange-light",
    panel: "from-brand-orange/[0.08] to-warm-cream",
    icon: "border-brand-orange/25 bg-brand-orange/10 text-brand-orange",
    check: "bg-brand-orange",
    row: "hover:border-brand-orange/25 hover:bg-brand-orange/[0.05]",
  },
  bronze: {
    bar: "from-brand-gold via-brand-orange to-brand-gold",
    panel: "from-brand-gold/[0.1] to-warm-cream",
    icon: "border-brand-gold/30 bg-brand-gold/15 text-brand-gold",
    check: "bg-brand-gold",
    row: "hover:border-brand-gold/30 hover:bg-brand-gold/[0.06]",
  },
} as const;

const trustItems = [
  {
    title: "Governance & Ethics",
    body: "Independent oversight boards, conflict-of-interest protocols, and ISO-aligned quality management.",
    Icon: IconScale,
  },
  {
    title: "Data Protection",
    body: "End-to-end encryption, role-based access, and comprehensive audit trails for all case materials.",
    Icon: IconLock,
  },
  {
    title: "International Compliance",
    body: "Aligned with international standards, local data sovereignty requirements, and industry best practice.",
    Icon: IconGlobe,
  },
];

const industries = [
  {
    title: "Insurance & Financial Services",
    body: "Risk assessment, fraud detection, and compliance audits.",
    accent: "navy" as const,
  },
  {
    title: "Banking & Investment Firms",
    body: "Integrity screening, internal investigations, and governance reviews.",
    accent: "orange" as const,
  },
  {
    title: "Auditing & Accounting Firms",
    body: "Due diligence support and forensic verification.",
    accent: "navy" as const,
  },
  {
    title: "Business Process Outsourcing",
    body: "Workforce integrity testing and operational compliance.",
    accent: "orange" as const,
  },
  {
    title: "Corporate Enterprises",
    body: "Executive vetting, security audits, and training programs.",
    accent: "navy" as const,
  },
  {
    title: "Government Agencies",
    body: "Regulatory compliance, polygraph examinations, and confidential investigations.",
    accent: "orange" as const,
  },
];

const polygraphServices = [
  "Pre-employment & security clearance screening",
  "Internal affairs & misconduct investigations",
  "Periodic integrity assessments",
  "Expert witness & report preparation",
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      {/* Services offered — photo cards */}
      <section className="relative overflow-hidden bg-background py-20 sm:py-24">
        <Image
          src="/services_background image.jpeg"
          alt=""
          fill
          className="object-cover object-center opacity-55 mix-blend-multiply"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-background/40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-warm-white via-warm-white/75 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent via-warm-white/70 to-warm-cream"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="section-divider-duo section-divider-center" aria-hidden />
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
              Core Expertise
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Multidisciplinary investigative, advisory, and training solutions
              for public and private sector clients worldwide.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {services.map((service, i) => {
              const accent = serviceAccentStyles[service.accent];

              return (
              <Link
                key={service.href}
                href={service.href}
                className={[
                  "group flex flex-col overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:ring-brand-orange/20",
                  "animate-fade-in-up",
                  ["", "animate-delay-1", "animate-delay-2"][i],
                ].join(" ")}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    priority={i === 0}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent"
                    aria-hidden
                  />
                  <Badge
                    variant="outline-accent"
                    className="absolute left-5 top-5 z-10 border-white/25 bg-white/95 shadow-sm backdrop-blur-md"
                  >
                    {service.badge}
                  </Badge>
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                    <h3 className="font-heading text-xl font-bold tracking-tight text-white sm:text-2xl">
                      {service.title}
                    </h3>
                  </div>
                </div>

                <div
                  className={cn(
                    "relative flex flex-1 flex-col bg-gradient-to-b px-4 py-3.5 sm:px-5 sm:py-4",
                    accent.panel,
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-x-0 top-0 h-1 bg-gradient-to-r",
                      accent.bar,
                    )}
                    aria-hidden
                  />

                  <div className="mb-2.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        accent.icon,
                      )}
                      aria-hidden
                    >
                      <service.Icon className="h-4 w-4" />
                    </span>
                    <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy">
                      Core services
                    </p>
                  </div>

                  <ul className="space-y-1.5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border border-border-subtle/80 bg-surface/90 px-2.5 py-1.5 text-xs font-medium leading-snug text-charcoal transition-colors",
                          accent.row,
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white",
                            accent.check,
                          )}
                          aria-hidden
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 border-t border-border-subtle/80 pt-2.5">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold text-brand-orange transition-colors group-hover:text-brand-orange-dark">
                      Explore {service.title.toLowerCase()}
                      <span
                        aria-hidden
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            );
            })}
          </div>
        </div>
      </section>

      {/* Polygraph CTA */}
      <section className="relative overflow-hidden bg-warm-cream py-20 sm:py-24">
        <div className="pattern-grid-warm absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Badge variant="default" className="mb-4 bg-charcoal">
                Specialised Unit
              </Badge>
              <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                Polygraph & Integrity Testing Unit
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 leading-relaxed text-muted-foreground">
                Certified examiners conduct scientifically validated polygraph
                examinations under rigorously enforced chain of custody and
                confidentiality protocols. Every stage of the process, from
                subject preparation through data analysis and reporting, follows
                standardized procedures designed to eliminate bias, preserve
                evidentiary integrity, and ensure legal admissibility. Examiners
                are credentialed professionals whose methods are benchmarked
                against international standards, and all documentation is
                securely maintained to guarantee accuracy, transparency, and
                confidentiality.
              </p>
            </div>

            <div className="lg:col-span-7">
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-black/[0.04] sm:min-h-[360px] lg:min-h-[480px]">
                <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold" aria-hidden />
                <Image
                  src="/polygraph-lie-detector.jpeg"
                  alt="Certified polygraph lie detector examination equipment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-brand-orange/20 bg-surface/90 p-3 shadow-sm sm:p-4 lg:col-span-12">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-orange/25 bg-brand-orange/10 text-brand-orange"
                    aria-hidden
                  >
                    <IconPulse className="h-4 w-4" />
                  </span>
                  <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy">
                    Services offered
                  </p>
                </div>
                <ul className="grid flex-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {polygraphServices.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-lg border border-border-subtle/80 bg-warm-cream/60 px-2.5 py-2 text-xs font-medium leading-snug text-charcoal transition-colors hover:border-brand-orange/25 hover:bg-brand-orange/[0.05]"
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[8px] font-bold text-white"
                        aria-hidden
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-center lg:col-span-12">
              <Link href="/polygraph" className="block w-full sm:w-auto">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Request Examination
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries we serve */}
      <section className="relative overflow-hidden py-20 sm:py-24">
        <div
          className="absolute inset-0 bg-gradient-to-br from-warm-cream via-warm-white to-brand-orange/10"
          aria-hidden
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: "var(--gradient-mesh)" }}
          aria-hidden
        />
        <div className="pattern-grid-warm absolute inset-0 opacity-50" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="text-left lg:col-span-5">
            <Badge variant="accent" className="mb-4 shadow-sm">
              Who We Serve
            </Badge>
            <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
              Industries We Serve
            </h2>
            <div className="section-divider-duo mt-4" aria-hidden />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              LEAF‑C supports individuals, families, and institutions with the
              same investigative, compliance, and integrity testing rigor,
              across sectors, and to international standards of accuracy,
              confidentiality, and accountability.
            </p>
            <div className="mt-6 flex flex-wrap justify-start gap-3">
              <span className="rounded-full border border-brand-navy/15 bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Private clients
              </span>
              <span className="rounded-full border border-brand-orange/25 bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-orange">
                Institutional partners
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {industries.map((industry, index) => {
              const accent = serviceAccentStyles[industry.accent];

              return (
                <article
                  key={industry.title}
                  className={[
                    "group relative overflow-hidden rounded-2xl border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
                    industry.accent === "navy"
                      ? "border-brand-navy/15 hover:border-brand-navy/30"
                      : "border-brand-orange/20 hover:border-brand-orange/40",
                  ].join(" ")}
                >
                  <div
                    className={cn("h-1 w-full bg-gradient-to-r", accent.bar)}
                    aria-hidden
                  />
                  <div className={cn("bg-gradient-to-br p-4", accent.panel)}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-heading text-sm font-bold leading-snug text-brand-navy">
                        {industry.title}
                      </h3>
                      <span className="shrink-0 font-heading text-[10px] font-bold tabular-nums text-muted-foreground/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {industry.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/get-started" className="block w-full sm:w-auto">
              <Button variant="accent" size="lg" className="w-full shadow-glow sm:w-auto">
                Request services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Governance */}
      <section className="relative overflow-hidden border-t border-border-subtle py-20">
        <Image
          src="/rules-followed.svg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-surface/55" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="section-divider-duo section-divider-center" aria-hidden />
            <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy">
              Trust & Governance
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Institutional safeguards designed for sensitive investigative work.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {trustItems.map((item) => (
              <Card key={item.title} variant="elevated">
                <div className="px-4 py-3.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-navy/15 bg-warm-cream text-brand-navy"
                    aria-hidden
                  >
                    <item.Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-2.5 font-heading text-sm font-semibold text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get started — service inquiry */}
      <section id="get-started" className="border-t border-border-subtle bg-warm-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <Badge variant="accent" className="mb-4">
                Get Started
              </Badge>
              <h2 className="font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                Ready to use our services?
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                Submit an inquiry to begin your engagement — whether you need
                consultancy, investigations, training, or integrity screening.
                Our intake team responds within two business days.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Confidential handling from first contact",
                  "Tailored to private, corporate, and government clients",
                  "Reference number provided for every submission",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-border-subtle bg-surface p-6 shadow-card sm:p-8">
              <h3 className="font-heading text-lg font-semibold text-heading">
                Service inquiry
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose your service, add your details, and submit — three quick steps.
              </p>
              <ServiceInquiryForm className="mt-6" compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
