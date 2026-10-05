import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { HomeHero } from "@/components/layout/HomeHero";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import { IconAlert, IconBriefcase, IconBuilding, IconClipboard, IconGlobe, IconGraduationCap, IconLock, IconMonitor, IconPulse, IconScale, IconSearch, IconUser } from "@/components/icons/MonoIcons";
import { cn } from "@/lib/utils";
import { INSIGHTS, categoriesWithArticles, getCategoryLabel } from "@/lib/insights";
import { getPublishedExperts } from "@/lib/experts";
import { ExpertPhotoPlaceholder } from "@/components/experts/ExpertPhotoPlaceholder";
import { ExpertContactLinks } from "@/components/experts/ExpertContactLinks";
import { AcademyCourseGrid } from "@/components/academy/AcademyCourseGrid";
import { SITE_CONTACT } from "@/lib/nav";

const services = [
  {
    title: "Consultancy and Advisory",
    href: "/consultancy",
    image: "/services-consulting.png",
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
    title: "Investigations and Operations",
    href: "/operations",
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
    title: "Training and Capacity Building",
    href: "/training",
    image: "/services-training.png",
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
  },
  orange: {
    bar: "from-brand-orange via-brand-gold to-brand-orange-light",
    panel: "from-brand-orange/[0.08] to-warm-cream",
    icon: "border-brand-orange/25 bg-brand-orange/10 text-brand-orange",
    check: "bg-brand-orange",
  },
  bronze: {
    bar: "from-brand-gold via-brand-orange to-brand-gold",
    panel: "from-brand-gold/[0.1] to-warm-cream",
    icon: "border-brand-gold/30 bg-brand-gold/15 text-brand-gold",
    check: "bg-brand-gold",
  },
} as const;

const industries = [
  {
    title: "Financial services and insurance",
    body: "Fraud investigations, claims enquiries, due diligence, compliance reviews, financial crime training and integrity screening",
    Icon: IconScale,
  },
  {
    title: "Government and public bodies",
    body: "Procurement integrity, anti-corruption controls, investigations training, policy advisory and institutional capacity building",
    Icon: IconBuilding,
  },
  {
    title: "Law enforcement and security",
    body: "Specialist training, intelligence analysis, polygraph support, interviewing and digital evidence awareness",
    Icon: IconLock,
  },
  {
    title: "Telecommunications and technology",
    body: "Fraud risk, digital evidence, cybercrime training, due diligence and ethics advisory",
    Icon: IconMonitor,
  },
  {
    title: "Transportation, logistics and construction",
    body: "Accident and incident investigations, loss enquiries, background checks and integrity controls",
    Icon: IconAlert,
  },
  {
    title: "Hospitality, tourism and gaming",
    body: "Fraud prevention, integrity screening, background checks, incident enquiries and staff training",
    Icon: IconUser,
  },
  {
    title: "Legal and professional services",
    body: "Specialist investigative support, due diligence, forensic review and expert training",
    Icon: IconClipboard,
  },
  {
    title: "Education and training institutions",
    body: "Joint programmes, professional development, ethics education and curriculum support",
    Icon: IconGraduationCap,
  },
  {
    title: "NGOs and international organizations",
    body: "Governance reviews, integrity systems, due diligence, investigations support and capacity building",
    Icon: IconGlobe,
  },
];

const polygraphDisciplines = [
  {
    title: "Pre-Employment & Security Clearance",
    body: "Integrity assessment for new hires and sensitive public-sector, enforcement, and financial roles.",
    tag: "Pre-placement",
    Icon: IconUser,
  },
  {
    title: "Internal Affairs & Misconduct",
    body: "Examinations supporting misconduct investigations, internal fraud, and breach-of-trust allegations.",
    tag: "Confidential inquiry",
    Icon: IconSearch,
  },
  {
    title: "Periodic Integrity Assessments",
    body: "Scheduled re-examinations for personnel in high-trust posts and classified environments.",
    tag: "Recertification",
    Icon: IconPulse,
  },
  {
    title: "Expert Witness & Reporting",
    body: "Documented analysis and reporting prepared for tribunals, hearings, and court of law.",
    tag: "Legal admissibility",
    Icon: IconScale,
  },
];

const polygraphCredentials = [
  "UK Polygraph Association",
  "American Polygraph Association (APA)",
  "Canadian Polygraph Association (CPA)",
];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section className="relative overflow-hidden bg-warm-cream py-16 sm:py-20">
        <div className="pattern-grid-warm absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-6">
              <Badge variant="accent" className="w-fit">
                About
              </Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                Who we are
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                <p>
                  LEAF-C brings together experience in investigations,
                  financial crime, compliance, intelligence, polygraph, digital
                  forensics and professional education. The company was
                  established to help organizations strengthen prevention,
                  improve investigative readiness and make defensible decisions
                  based on reliable information.
                </p>
                <p>
                  Our work serves organizations that require specialist
                  capability without maintaining every discipline internally.
                  We define the scope of each engagement, assign appropriate
                  expertise and communicate findings through clear reports,
                  briefings or training outcomes.
                </p>
              </div>
              <Button href="/polygraph" variant="outline" size="md" className="mt-8">
                Polygraph & Integrity Unit
              </Button>
            </div>

            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-border-subtle">
                <div className="grid sm:grid-cols-2">
                  <div className="border-b border-border-subtle p-5 sm:border-b-0 sm:border-r">
                    <p className="font-heading text-4xl font-extrabold tracking-tight text-brand-navy">
                      1,000+
                    </p>
                    <p className="mt-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      Polygraph examinations
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Screening, investigation, and integrity assignments.
                    </p>
                  </div>
                  <div className="p-5">
                    <p className="font-heading text-4xl font-extrabold tracking-tight text-brand-navy">
                      25+
                    </p>
                    <p className="mt-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      Combined years of experience
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Examiner experience pooled across the Polygraph
                      Department.
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 bg-charcoal px-5 py-4">
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                    Certified examiners
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {polygraphCredentials.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/90"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
              Our Divisions
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-navy">
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
                  <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                    <h3 className="font-heading text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
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
                      Services
                    </p>
                  </div>

                  <ul className="space-y-1.5">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 py-1 text-xs font-medium leading-snug text-charcoal"
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

      <section className="relative overflow-hidden bg-background py-20 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Badge variant="default" className="mb-4 bg-charcoal">
                Specialised Unit
              </Badge>
              <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                Polygraph & Integrity Testing Unit
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Certified examiners conduct scientifically validated polygraph
                examinations under chain of custody and confidentiality
                protocols. Every stage, from subject preparation through
                analysis and reporting, follows documented procedure so the
                work can stand up to later review.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                Examiners are credentialed to UKPA, APA, and CPA standards.
                Documentation is held securely to protect accuracy and
                confidentiality.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4">
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    1,000+
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    Examinations
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    25+
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    Combined years
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    APA
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    UKPA and CPA
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {[
                  "Documented protocol from preparation through reporting",
                  "Confidential examination environments",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[8px] font-bold text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-charcoal shadow-card sm:min-h-[380px] lg:min-h-[520px]">
                <div
                  className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
                  aria-hidden
                />
                <Image
                  src="/polygraph-lie-detector.jpeg"
                  alt="Certified polygraph lie detector examination equipment"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent px-5 pb-5 pt-16 sm:px-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
                      Computerised examination instrumentation
                    </span>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90">
                      Chain of custody verified
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] text-white/65">
                    Controlled examination environment · APA-aligned protocol
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                  Examination & assessment disciplines
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-brand-navy">
                  How the unit is used
                </h3>
              </div>
              <p className="text-xs font-medium text-muted-foreground">
                {polygraphDisciplines.length} documented examination types
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {polygraphDisciplines.map((item) => (
                <article
                  key={item.title}
                  className="rounded-xl bg-surface px-4 py-4 shadow-sm"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-navy/15 bg-warm-cream text-brand-navy"
                    aria-hidden
                  >
                    <item.Icon className="h-3.5 w-3.5" />
                  </span>
                  <h4 className="mt-3 font-heading text-[13px] font-bold leading-snug text-brand-navy">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-3 font-heading text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    {item.tag}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl bg-charcoal px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Confidential scheduling
                </p>
                <h3 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                  Require confidential screening or assessment?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  Examinations are scoped discreetly, with chain of custody
                  and examiner-only access to results.
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-xs">
                <Button href="/polygraph" variant="accent" size="lg" className="w-full">
                  Request Examination
                </Button>
                <Link
                  href="/polygraph"
                  className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/30 px-7 font-heading text-base font-semibold text-white transition-colors hover:bg-white hover:text-brand-navy"
                >
                  View the unit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-charcoal py-20 text-white sm:py-24">
        <Image
          src="/training_background.jpeg"
          alt=""
          fill
          className="object-cover object-center opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/70" aria-hidden />
        <div
          className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge variant="accent" className="shadow-sm">
                Training & Capacity Building
              </Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                LEAF-C Academy
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Structured programmes in investigations, integrity, and
                financial crime, with case work and a LEAF-C certificate.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {[
                  { label: "Investigate", detail: "Financial crime, fraud, and digital evidence" },
                  { label: "Examine", detail: "Interviewing, integrity testing, and case documentation" },
                  { label: "Certify", detail: "LEAF-C certificates; CPE on select courses" },
                ].map((item) => (
                  <li
                    key={item.label}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-heading text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90"
                    title={item.detail}
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
              <Link
                href="/get-started"
                className="mt-6 inline-block font-heading text-2xl font-extrabold tracking-tight text-brand-gold drop-shadow-[0_0_18px_rgba(212,175,55,0.45)] transition-all hover:text-brand-orange hover:drop-shadow-[0_0_24px_rgba(232,140,48,0.55)] sm:text-3xl"
              >
                Get started!
              </Link>
            </div>
            <Button href="/training" variant="accent" size="md">
              View upcoming programmes
            </Button>
          </div>

          <AcademyCourseGrid />
        </div>
      </section>

      <section className="relative overflow-hidden bg-background py-20 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-5">
              <Badge variant="accent">Practical guidance</Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                Insights
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                Short briefings on fraud, integrity testing, digital evidence,
                and financial-crime risk for boards, counsel, and
                investigators. Written to be used, not to advertise a product.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4">
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    {INSIGHTS.length}
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    Published articles
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    {categoriesWithArticles().length}
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    Active topics
                  </p>
                </div>
                <div>
                  <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                    {INSIGHTS[0]?.readMinutes ?? 8}
                  </p>
                  <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                    Min. typical read
                  </p>
                </div>
              </div>

              <ul className="mt-6 flex flex-wrap gap-2">
                {categoriesWithArticles().map((category) => (
                  <li
                    key={category.id}
                    className="rounded-full bg-warm-cream px-3 py-1 font-heading text-[11px] font-semibold text-brand-navy"
                  >
                    {category.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              {INSIGHTS[0] ? (
                <Link
                  href={`/insights/${INSIGHTS[0].slug}`}
                  className="group relative block min-h-[280px] overflow-hidden rounded-3xl bg-charcoal sm:min-h-[380px] lg:min-h-[480px]"
                >
                  <div
                    className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
                    aria-hidden
                  />
                  <Image
                    src="/consulting_backgroung.jpeg"
                    alt=""
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent" aria-hidden />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
                    <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
                      {getCategoryLabel(INSIGHTS[0].category)} · {INSIGHTS[0].readMinutes} min read
                    </p>
                    <h3 className="mt-3 font-heading text-2xl font-bold leading-snug text-white sm:text-3xl">
                      {INSIGHTS[0].title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
                      {INSIGHTS[0].description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold">
                      Read article
                      <span aria-hidden>→</span>
                    </span>
                  </div>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                  Published briefings
                </p>
                <h3 className="mt-2 font-heading text-2xl font-bold text-brand-navy">
                  More from Insights
                </h3>
              </div>
              <Link
                href="/insights"
                className="text-sm font-semibold text-brand-orange hover:text-brand-orange-dark"
              >
                View all insights →
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INSIGHTS.slice(1, 4).map((article) => (
                <article key={article.slug} className="rounded-2xl bg-surface px-5 py-6 shadow-sm">
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-brand-orange">
                    {getCategoryLabel(article.category)}
                  </p>
                  <h3 className="mt-3 font-heading text-base font-bold leading-snug text-brand-navy">
                    <Link
                      href={`/insights/${article.slug}`}
                      className="hover:underline decoration-brand-orange/50 underline-offset-4"
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    {article.description}
                  </p>
                  <Link
                    href={`/insights/${article.slug}`}
                    className="mt-4 inline-block text-xs font-semibold text-brand-orange hover:text-brand-orange-dark"
                  >
                    Read article →
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl bg-charcoal px-6 py-8 text-white sm:px-10 sm:py-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                  Confidential consultation
                </p>
                <h3 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                  Need advice on a live matter?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  These articles are general guidance. For a suspected fraud,
                  integrity issue, or evidence problem, speak with LEAF-C
                  confidentially.
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-xs">
                <Button href="/get-started" variant="accent" size="lg" className="w-full">
                  Request a consultation
                </Button>
                <Link
                  href="/insights"
                  className="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-lg border border-white/30 px-7 font-heading text-base font-semibold text-white transition-colors hover:bg-white hover:text-brand-navy"
                >
                  All insights
                </Link>
              </div>
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
          <div className="max-w-3xl">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-brand-navy/15 bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-navy">
                Private clients
              </span>
              <span className="rounded-full border border-brand-orange/25 bg-surface/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-orange">
                Institutional partners
              </span>
            </div>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {industries.map((industry) => (
              <article
                key={industry.title}
                className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface px-4 py-4 shadow-sm"
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-navy/10 bg-warm-cream text-brand-navy"
                  aria-hidden
                >
                  <industry.Icon className="h-3.5 w-3.5" />
                </span>
                <h3 className="mt-3 font-heading text-sm font-bold leading-snug text-brand-navy">
                  {industry.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {industry.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button href="/get-started" variant="accent" size="lg" className="w-full shadow-glow sm:w-auto">
              Request services
            </Button>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-background py-20 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Badge variant="accent">Leadership</Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                Our Experts
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <p className="mt-6 max-w-2xl text-muted-foreground">
                The professionals who lead LEAF-C’s investigations, training,
                and integrity work.
              </p>
            </div>
            <Button href="/experts" variant="outline" size="md">
              View experts
            </Button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {getPublishedExperts().map((expert) => (
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
                <ExpertContactLinks expert={expert} className="mt-4" />
              </article>
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
              <address className="mt-8 not-italic text-sm text-muted-foreground">
                <p className="font-heading text-sm font-semibold text-heading">
                  {SITE_CONTACT.location}
                </p>
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
