import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
  IconClipboard,
  IconFile,
  IconPulse,
  IconScale,
  IconSearch,
  IconUser,
} from "@/components/icons/MonoIcons";

const sessionTypes = [
  {
    title: "Pre-Employment Screening",
    description:
      "Background verification and integrity assessment for new hires in sensitive roles.",
    Icon: IconUser,
  },
  {
    title: "Internal Affairs Support",
    description:
      "Examinations supporting misconduct investigations and disciplinary proceedings.",
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

const processSteps = [
  {
    step: "01",
    title: "Preparation",
    desc: "Rights briefing, consent, and suitability screening before any recording begins.",
  },
  {
    step: "02",
    title: "Examination",
    desc: "A structured interview with computerised psychophysiological recording.",
  },
  {
    step: "03",
    title: "Analysis",
    desc: "Documented review by a credentialed examiner under chain of custody.",
  },
  {
    step: "04",
    title: "Reporting",
    desc: "Confidential findings prepared for the instructing organisation, and for hearings where required.",
  },
];

const suitableUses = [
  {
    title: "High-trust hiring",
    body: "An additional integrity measure for posts with unsupervised access to cash, controlled goods, investigative files, IT administration, or vulnerable people — sitting inside a wider background-check process.",
    Icon: IconUser,
  },
  {
    title: "A defined incident",
    body: "A specific, testable question after an allegation or loss — not a broad loyalty test, and not a substitute for records, CCTV, or access-log review.",
    Icon: IconSearch,
  },
  {
    title: "Written integrity programmes",
    body: "Periodic examinations for cash, armoury, intelligence, or other high-trust posts, applied consistently under policy rather than used ad hoc.",
    Icon: IconClipboard,
  },
];

const notSuitable = [
  "There is no defined issue, timeframe, or group with opportunity.",
  "Core records, CCTV, or access logs have not been preserved or reviewed.",
  "The organisation cannot explain, in writing, the purpose, consent, and use of results.",
];

const protocols = [
  "All sessions conducted in ISO-certified examination rooms",
  "Results encrypted at rest with examiner-only decryption keys",
  "Full audit trail maintained for legal admissibility review",
  "Examinee rights briefing provided prior to every session",
];

const credentials = [
  "UK Polygraph Association",
  "American Polygraph Association (APA)",
  "Canadian Polygraph Association (CPA)",
];

export default function PolygraphPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <Image
          src="/polygraph_background.jpeg"
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
            Specialised Unit
          </Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            Polygraph & Integrity Testing Unit
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            Certified polygraph examiners delivering scientifically validated
            integrity assessments under strict confidentiality and
            chain-of-custody protocols.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/10 px-5 py-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-brand-navy text-white"
              aria-hidden
            >
              <IconScale className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Certified Examiners</p>
              <p className="text-xs text-white/60">
                American Polygraph Association standards
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border-subtle bg-warm-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-lg font-semibold text-heading">
            How the unit works
          </h2>
          <div className="mt-5 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            <p>
              A polygraph examination is a structured interview supported by
              psychophysiological recording. Certified examiners conduct the
              work under chain of custody and confidentiality protocols. Every
              stage, from subject preparation through analysis and reporting,
              follows documented procedure so the work can stand up to later
              review.
            </p>
            <p>
              The instrument does not replace evidence. Used well, it can
              narrow a specific issue, support pre-employment screening for
              high-trust roles, and form part of a periodic integrity
              programme. Examiners are credentialed to UKPA, APA, and CPA
              standards. Documentation is held securely to protect accuracy
              and confidentiality.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 sm:max-w-xl">
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

          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {processSteps.map((s) => (
              <div
                key={s.step}
                className="relative min-w-0 rounded-xl border border-border-subtle bg-surface p-2.5 sm:p-4"
              >
                <span className="font-heading text-lg font-bold text-brand-orange/30 sm:text-2xl">
                  {s.step}
                </span>
                <h3 className="mt-1 font-heading text-xs font-semibold text-heading sm:text-sm">
                  {s.title}
                </h3>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="section-divider-duo shrink-0" aria-hidden />
          <h2 className="font-heading text-2xl font-bold text-brand-navy">
            Examination Types
          </h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {sessionTypes.map((type) => (
            <Card key={type.title}>
              <CardBody className="flex items-start gap-3 px-4 py-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                  aria-hidden
                >
                  <type.Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-heading">
                    {type.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative min-h-[220px] overflow-hidden rounded-2xl bg-charcoal sm:min-h-[320px]">
              <Image
                src="/polygraph-lie-detector.jpeg"
                alt="Certified polygraph lie detector examination equipment"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 58vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal via-charcoal/80 to-transparent px-5 pb-5 pt-16">
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
          <div className="lg:col-span-5">
            <h2 className="font-heading text-xl font-bold text-brand-navy">
              Expert witness and reporting
            </h2>
            <div className="section-divider-duo mt-3" aria-hidden />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Where the instructing organisation may later need the work to
              stand up in a hearing or in court, examiners can describe their
              protocol, chain of custody, and limitations in plain language.
              Documented analysis is prepared for tribunals, hearings, and
              court of law.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Results inform — they do not automatically determine —
              employment or disciplinary decisions. They belong in a
              confidential file with a narrow distribution list.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-navy">
            When an examination is useful
          </h2>
          <div className="section-divider-duo mt-3" aria-hidden />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {suitableUses.map((item) => (
              <Card key={item.title}>
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
            ))}
          </div>
        </div>

        <Card className="mt-8">
          <CardBody className="px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                aria-hidden
              >
                <IconAlert className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="font-heading text-sm font-semibold text-heading">
                  When you should not reach for the polygraph
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Do not use an examination to paper over a missing
                  investigation, to pressure a confession, or to decide a
                  workplace dispute that is really about performance. A
                  professional examiner will screen for medical and other
                  suitability issues rather than force a session that cannot
                  be interpreted.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {notSuitable.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-orange"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card variant="callout" className="mt-8">
          <CardBody>
            <h3 className="font-heading font-semibold text-heading">
              Protocol & Confidentiality
            </h3>
            <div className="section-divider-duo mt-2" aria-hidden />
            <ul className="mt-4 space-y-3">
              {protocols.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Examiner credentials: {credentials.join(" · ")}.
            </p>
          </CardBody>
        </Card>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
              aria-hidden
            >
              <IconFile className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold text-heading">
                Practical guidance
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                When an organisation should consider a polygraph examination —
                and when it should not.
              </p>
            </div>
          </div>
          <Button
            href="/insights/when-an-organization-should-consider-a-polygraph-examination"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            Read the brief
          </Button>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <Card variant="featured" className="lg:col-span-8">
            <CardHeader>
              <CardTitle>Request Examination</CardTitle>
              <CardDescription>
                Submit a booking request for polygraph services.
              </CardDescription>
            </CardHeader>
            <CardBody>
              <ServiceInquiryForm initialServiceInterest="polygraph" />
            </CardBody>
          </Card>

          <div className="space-y-6 lg:col-span-4">
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

            <Link
              href="/get-started"
              className="block text-center text-sm font-medium text-brand-orange hover:underline"
            >
              Request services →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
