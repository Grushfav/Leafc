import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import {
  Card,
  CardBody,
} from "@/components/ui/Card";
import { IconBriefcase, IconBuilding, IconGlobe, IconGraduationCap, IconLock, IconPulse, IconScale, IconSearch, IconUser } from "@/components/icons/MonoIcons";
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

const partners = [
  "Future Hub Alliance",
  "International Compliance Board",
  "Regional Development Bank",
  "National Justice Institute",
  "Integrity Reform Initiative",
];

const clientSegments = [
  {
    title: "Private Clients",
    subtitle: "Individuals & families",
    accent: "navy" as const,
    Icon: IconUser,
    items: [
      "Personal due diligence & background checks",
      "Discreet investigative support",
      "Integrity & polygraph screening",
      "Confidential advisory consultations",
    ],
  },
  {
    title: "Corporate Clients",
    subtitle: "Enterprises & institutions",
    accent: "orange" as const,
    Icon: IconBuilding,
    items: [
      "Compliance frameworks & governance reviews",
      "Internal investigations & fraud response",
      "Workforce training & certification",
      "Enterprise risk & integrity programmes",
    ],
  },
];

const serveStats = [
  { value: "Same rigour", label: "Private or enterprise mandates" },
  { value: "Global", label: "Multi-jurisdictional coverage" },
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
      {/* Hero — tech background with readable text column */}
      <section className="relative min-h-[442px] overflow-hidden bg-charcoal sm:min-h-[493px]">
        <Image
          src="/hero-justice.svg"
          alt=""
          fill
          priority
          className="object-cover object-[center_right]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-warm-white/95 from-0% via-warm-white/75 via-[38%] to-transparent to-[58%]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 pt-[5.1rem] pb-[4.25rem] sm:px-6 sm:pt-[6.8rem] sm:pb-[5.1rem] lg:px-8">
          <div className="max-w-2xl animate-fade-in-up rounded-2xl bg-warm-white/80 p-5 shadow-lg sm:p-7 lg:max-w-xl">
            <Badge variant="accent" className="mb-5">
              Integrity & Excellence
            </Badge>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
              Integrity. Insight. Innovation.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-navy/80 sm:text-lg">
              LEAF‑C provides multidisciplinary investigative, compliance, and
              training services, combining institutional rigor with deep
              expertise to support governments, enterprises, and justice partners
              worldwide.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/get-started">
                <Button variant="accent" size="md">
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" size="md">
                  Access Client Portal
                </Button>
              </Link>
              <Link href="/consultancy">
                <Button variant="outline" size="md">
                  Explore Divisions
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services offered — photo cards */}
      <section className="relative bg-background py-20 sm:py-24">
        <div className="pattern-dots absolute inset-0 opacity-50" aria-hidden />
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
                    "relative flex flex-1 flex-col bg-gradient-to-b px-5 py-5 sm:px-6 sm:py-6",
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

                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                        accent.icon,
                      )}
                      aria-hidden
                    >
                      <service.Icon className="h-5 w-5" />
                    </span>
                    <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-navy">
                      Core services
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border border-border-subtle/80 bg-surface/90 px-3.5 py-3 text-sm font-medium leading-snug text-charcoal shadow-sm transition-colors",
                          accent.row,
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white",
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

                  <div className="mt-5 border-t border-border-subtle/80 pt-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange transition-colors group-hover:text-brand-orange-dark">
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
                Certified examiners deliver scientifically validated examinations
                — governed by strict chain-of-custody and confidentiality
                protocols.
              </p>

              <div className="mt-8 rounded-2xl border border-brand-orange/20 bg-surface/90 p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-orange/25 bg-brand-orange/10 text-brand-orange"
                    aria-hidden
                  >
                    <IconPulse className="h-5 w-5" />
                  </span>
                  <p className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-navy">
                    Services offered
                  </p>
                </div>
                <ul className="space-y-2">
                  {polygraphServices.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-border-subtle/80 bg-warm-cream/60 px-3.5 py-3 text-sm font-medium leading-snug text-charcoal transition-colors hover:border-brand-orange/25 hover:bg-brand-orange/[0.05]"
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[9px] font-bold text-white"
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

            <div className="flex flex-col gap-5 lg:col-span-7">
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
              <Link href="/polygraph" className="block sm:self-end">
                <Button variant="accent" size="lg" className="w-full sm:w-auto">
                  Request Examination
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Private & corporate clients */}
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
        <div
          className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-brand-orange/15 blur-3xl"
          aria-hidden
        />
        <div
          className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-brand-navy/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <Badge variant="accent" className="mb-4 shadow-sm">
                Who We Serve
              </Badge>
              <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                Institutional &{" "}
                <span className="bg-gradient-to-r from-brand-orange to-brand-gold bg-clip-text text-transparent">
                  Corporate
                </span>{" "}
                Solutions
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                LEAF‑C supports individuals, families, and organizations with
                the same uncompromising rigor, providing tailored investigative,
                compliance, and training solutions whether the mandate is personal
                or enterprise‑wide.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {serveStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-brand-navy/10 bg-surface/80 p-4 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
                  >
                    <p className="font-heading text-sm font-bold uppercase tracking-wide text-brand-orange">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link href="/get-started" className="mt-8 inline-block">
                <Button variant="accent" size="lg" className="shadow-glow">
                  Request services
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
              {clientSegments.map((segment, index) => (
                <article
                  key={segment.title}
                  className={[
                    "group relative overflow-hidden rounded-3xl border bg-surface shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl",
                    segment.accent === "navy"
                      ? "border-brand-navy/15 hover:border-brand-navy/30 hover:shadow-[0_12px_40px_rgb(0_38_99_/_0.12)]"
                      : "border-brand-orange/20 hover:border-brand-orange/40 hover:shadow-glow",
                    "animate-fade-in-up",
                    index === 1 ? "animate-delay-1 sm:mt-8" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "h-1.5 w-full",
                      segment.accent === "navy"
                        ? "bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-orange"
                        : "bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange-light",
                    ].join(" ")}
                    aria-hidden
                  />
                  <div className="p-6 sm:p-7">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
                          {segment.subtitle}
                        </p>
                        <h3 className="mt-2 font-heading text-xl font-bold text-charcoal">
                          {segment.title}
                        </h3>
                      </div>
                      <span
                        className={[
                          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105",
                          segment.accent === "navy"
                            ? "border-brand-navy/15 bg-brand-navy/5 text-brand-navy"
                            : "border-brand-orange/25 bg-brand-orange/10 text-brand-orange",
                        ].join(" ")}
                        aria-hidden
                      >
                        <segment.Icon className="h-7 w-7" />
                      </span>
                    </div>

                    <ul className="mt-6 space-y-3">
                      {segment.items.map((item) => (
                        <li
                          key={item}
                          className={[
                            "flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm text-muted-foreground transition-colors",
                            segment.accent === "navy"
                              ? "group-hover:border-brand-navy/10 group-hover:bg-brand-navy/[0.03]"
                              : "group-hover:border-brand-orange/15 group-hover:bg-brand-orange/[0.04]",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                              segment.accent === "navy" ? "bg-brand-navy" : "bg-brand-orange",
                            ].join(" ")}
                            aria-hidden
                          >
                            ✓
                          </span>
                          <span className="font-medium text-charcoal/85">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
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
        <div className="absolute inset-0 bg-surface/85" aria-hidden />
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
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {trustItems.map((item) => (
              <Card key={item.title} variant="elevated">
                <CardBody>
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-navy/15 bg-warm-cream text-brand-navy"
                    aria-hidden
                  >
                    <item.Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </CardBody>
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

      {/* Partner strip */}
      <section className="border-y border-border-subtle bg-surface py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center font-heading text-xs font-semibold uppercase tracking-widest text-brand-navy">
            Trusted by Leading Institutions
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {partners.map((partner) => (
              <span
                key={partner}
                className="rounded-lg border border-brand-navy/15 bg-warm-white px-5 py-2.5 font-heading text-sm font-medium text-charcoal/70 transition-colors hover:border-brand-navy/30 hover:text-brand-navy"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
