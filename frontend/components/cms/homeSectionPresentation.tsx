"use client";

/**
 * Fixed visual chrome for the Home page CMS sections.
 * Backgrounds, patterns, and text alignment are design-locked — not CMS fields.
 * Only editable copy/media from the section document is injected.
 */

import Image from "next/image";
import Link from "next/link";
import { AcademyCourseGrid } from "@/components/academy/AcademyCourseGrid";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import { ExpertContactLinks } from "@/components/experts/ExpertContactLinks";
import { ExpertPhotoPlaceholder } from "@/components/experts/ExpertPhotoPlaceholder";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { PhotoCoverflowGallery } from "@/components/cms/PhotoCoverflowGallery";
import { HomeInsightsShowcase } from "@/components/insights/HomeInsightsShowcase";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { resolveCmsAssetUrl } from "@/lib/cms/api";
import type { ExpertDraft, Section } from "@/lib/cms/types";
import { SITE_CONTACT } from "@/lib/nav";
import { cn } from "@/lib/utils";

function mediaSrc(url?: string) {
  return resolveCmsAssetUrl(url);
}

const accentStyles = {
  navy: {
    bar: "from-brand-navy via-brand-navy-light to-brand-orange",
    panel: "from-brand-navy/[0.06] to-warm-cream",
    check: "bg-brand-navy",
  },
  orange: {
    bar: "from-brand-orange via-brand-gold to-brand-orange-light",
    panel: "from-brand-orange/[0.08] to-warm-cream",
    check: "bg-brand-orange",
  },
  bronze: {
    bar: "from-brand-gold via-brand-orange to-brand-gold",
    panel: "from-brand-gold/[0.1] to-warm-cream",
    check: "bg-brand-gold",
  },
} as const;

const DEFAULT_ABOUT_SIDE_PANEL = {
  stats: [
    {
      value: "1,000+",
      label: "Polygraph examinations",
      body: "Screening, investigation, and integrity assignments.",
    },
    {
      value: "25+",
      label: "Combined years of experience",
    },
  ],
  footerTitle: "Certified examiners",
  footerItems: [
    "UK Polygraph Association",
    "American Polygraph Association (APA)",
    "Canadian Polygraph Association (CPA)",
  ],
};

function isIndustriesGrid(section: Extract<Section, { type: "cardGrid" }>) {
  const heading = (section.heading ?? "").toLowerCase();
  const label = (section.label ?? "").toLowerCase();
  return heading.includes("industr") || label.includes("who we serve");
}

export function renderHomeSection(section: Section, experts: ExpertDraft[]) {
  switch (section.type) {
    case "richText": {
      const sidePanel =
        section.sidePanel?.stats?.length
          ? section.sidePanel
          : DEFAULT_ABOUT_SIDE_PANEL;
      const [primaryStat, secondaryStat] = sidePanel.stats;
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-warm-cream py-16 sm:py-20"
        >
          <div className="pattern-grid-warm absolute inset-0 opacity-30" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-6">
                {section.label ? (
                  <Badge variant="accent" className="w-fit">
                    {section.label}
                  </Badge>
                ) : null}
                {section.heading ? (
                  <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="section-divider-duo mt-4" aria-hidden />
                <div className="mt-6 max-w-xl space-y-4 text-[15px] leading-relaxed text-muted-foreground">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={`${section.id}-p-${index}`}>{paragraph}</p>
                  ))}
                </div>
                <Button href="/about" variant="outline" size="md" className="mt-8">
                  About us
                </Button>
              </div>

              <div className="lg:col-span-6">
                <div className="overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-border-subtle">
                  <div className="grid sm:grid-cols-2">
                    <div className="border-b border-border-subtle p-5 sm:border-b-0 sm:border-r">
                      <p className="font-heading text-4xl font-extrabold tracking-tight text-brand-navy">
                        {primaryStat?.value}
                      </p>
                      <p className="mt-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        {primaryStat?.label}
                      </p>
                      {primaryStat?.body ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {primaryStat.body}
                        </p>
                      ) : null}
                    </div>
                    <div className="p-5">
                      <p className="font-heading text-4xl font-extrabold tracking-tight text-brand-navy">
                        {secondaryStat?.value}
                      </p>
                      <p className="mt-2 font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        {secondaryStat?.label}
                      </p>
                      {secondaryStat?.body ? (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {secondaryStat.body}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {sidePanel.footerTitle || sidePanel.footerItems?.length ? (
                    <div className="border-t border-white/10 bg-charcoal px-5 py-4">
                      {sidePanel.footerTitle ? (
                        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-gold">
                          {sidePanel.footerTitle}
                        </p>
                      ) : null}
                      {sidePanel.footerItems?.length ? (
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {sidePanel.footerItems.map((item) => (
                            <li
                              key={item}
                              className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-white/90"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "cardGrid": {
      if (isIndustriesGrid(section)) {
        return (
          <section
            key={section.id}
            className="relative overflow-hidden py-20 sm:py-24"
          >
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
              <div className="max-w-3xl text-left">
                {section.label ? (
                  <Badge variant="accent" className="mb-4 shadow-sm">
                    {section.label}
                  </Badge>
                ) : null}
                {section.heading ? (
                  <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="section-divider-duo mt-4" aria-hidden />
                {section.paragraph ? (
                  <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                    {section.paragraph}
                  </p>
                ) : null}
              </div>
              <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.cards.map((card) => (
                  <article key={card.id} className="flex h-full gap-2.5 text-left">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange"
                      aria-hidden
                    >
                      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                        <path
                          d="M3.5 8.5 6.5 11.5 12.5 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-heading text-sm font-bold leading-snug text-brand-navy">
                        {card.title}
                      </h3>
                      {card.body ? (
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {card.body}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
              <div className="mt-12 flex justify-center">
                <Button
                  href="/get-started"
                  variant="accent"
                  size="lg"
                  className="w-full shadow-glow sm:w-auto"
                >
                  Request services
                </Button>
              </div>
            </div>
          </section>
        );
      }

      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-background py-20 sm:py-24"
        >
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
              {section.heading ? (
                <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                  {section.heading}
                </h2>
              ) : null}
              {section.paragraph ? (
                <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-navy">
                  {section.paragraph}
                </p>
              ) : null}
            </div>
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {section.cards.map((card) => {
                const image = mediaSrc(card.image);
                const accentKey =
                  card.accent === "orange" || card.accent === "bronze"
                    ? card.accent
                    : "navy";
                const accent = accentStyles[accentKey];
                const inner = (
                  <>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-warm-cream">
                      {image ? (
                        <Image
                          src={image}
                          alt={card.imageAlt ?? card.title}
                          fill
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : null}
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/20 to-transparent"
                        aria-hidden
                      />
                      <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6">
                        <h3 className="font-heading text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                          {card.title}
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
                      {section.label ? (
                        <p className="mb-2.5 font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-navy">
                          {section.label}
                        </p>
                      ) : null}
                      {card.items?.length ? (
                        <ul className="space-y-1.5">
                          {card.items.map((item) => (
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
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </>
                );
                return card.href ? (
                  <Link
                    key={card.id}
                    href={card.href}
                    className="group flex flex-col overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-black/[0.04] transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:ring-brand-orange/20"
                  >
                    {inner}
                  </Link>
                ) : (
                  <article
                    key={card.id}
                    className="flex flex-col overflow-hidden rounded-3xl bg-surface shadow-card ring-1 ring-black/[0.04]"
                  >
                    {inner}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    }

    case "textImage": {
      const image = mediaSrc(section.image) ?? section.image;
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-background py-20 sm:py-24"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="text-left lg:col-span-5">
                {section.label ? (
                  <Badge variant="default" className="mb-4 bg-charcoal">
                    {section.label}
                  </Badge>
                ) : null}
                {section.heading ? (
                  <h2 className="font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="section-divider-duo mt-4" aria-hidden />
                {section.paragraph ? (
                  <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                    {section.paragraph}
                  </p>
                ) : null}
              </div>
              <div className="lg:col-span-7">
                {image ? (
                  <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-charcoal shadow-card sm:min-h-[380px] lg:min-h-[520px]">
                    <div
                      className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
                      aria-hidden
                    />
                    <Image
                      src={image}
                      alt={section.imageAlt ?? ""}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case "photoCards":
      return (
        <PhotoCoverflowGallery
          key={section.id}
          label={section.label}
          heading={section.heading}
          paragraph={section.paragraph}
          slides={section.cards}
        />
      );

    case "academy":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-charcoal py-20 text-white sm:py-24"
        >
          <Image
            src="/training_background.jpeg"
            alt=""
            fill
            className="object-cover object-center opacity-25"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/90 to-charcoal/70"
            aria-hidden
          />
          <div
            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
            aria-hidden
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-left">
              {section.label ? (
                <Badge variant="accent" className="shadow-sm">
                  {section.label}
                </Badge>
              ) : null}
              {section.heading ? (
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {section.heading}
                </h2>
              ) : null}
              <div className="section-divider-duo mt-4" aria-hidden />
              {section.paragraph ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {section.paragraph}
                </p>
              ) : null}
            </div>
            <div className="mt-10">
              <AcademyCourseGrid />
            </div>
            {section.buttonLabel && section.buttonHref ? (
              <div className="mt-10 flex justify-center">
                <Button href={section.buttonHref} variant="accent" size="md">
                  {section.buttonLabel}
                </Button>
              </div>
            ) : null}
          </div>
        </section>
      );

    case "insights":
      return (
        <HomeInsightsShowcase
          key={section.id}
          label={section.label}
          heading={section.heading}
          paragraph={section.paragraph}
          buttonLabel={section.buttonLabel}
          buttonHref={section.buttonHref}
        />
      );

    case "experts": {
      const HOME_EXPERTS_LIMIT = 6;
      const visible = experts
        .filter((expert) => expert.published)
        .slice(0, HOME_EXPERTS_LIMIT);
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-background py-20 sm:py-24"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-left">
              {section.label ? <Badge variant="accent">{section.label}</Badge> : null}
              {section.heading ? (
                <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                  {section.heading}
                </h2>
              ) : null}
              <div className="section-divider-duo mt-4" aria-hidden />
              {section.paragraph ? (
                <p className="mt-6 max-w-2xl text-muted-foreground">{section.paragraph}</p>
              ) : null}
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((expert) => {
                const photo = mediaSrc(expert.photoUrl ?? undefined);
                return (
                  <article
                    key={expert.slug}
                    className="flex h-full flex-col items-center rounded-2xl bg-surface px-6 py-8 text-center"
                  >
                    <ExpertPhotoPlaceholder
                      name={expert.name}
                      portrait={expert.portrait ?? "male"}
                      photoSrc={photo}
                      fit="cover"
                      className="h-32 w-32 sm:h-36 sm:w-36"
                    />
                    <h3 className="mt-5 font-heading text-lg font-bold text-brand-navy">
                      {expert.name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-brand-orange">
                      {expert.title}
                    </p>
                    <ExpertContactLinks
                      expert={{
                        slug: expert.slug,
                        name: expert.name,
                        initials: expert.initials ?? expert.name.slice(0, 2),
                        title: expert.title,
                        portrait: expert.portrait ?? "male",
                        published: expert.published,
                        email: expert.email ?? undefined,
                        linkedin: expert.linkedin ?? undefined,
                      }}
                      className="mt-4"
                    />
                  </article>
                );
              })}
            </div>
            <div className="mt-12 flex justify-center">
              <Button href="/experts" variant="outline" size="md">
                View experts
              </Button>
            </div>
          </div>
        </section>
      );
    }

    case "newsletter":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-brand-navy py-20 text-white sm:py-24"
        >
          <div
            className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-brand-gold/20 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div className="text-left">
              {section.label ? (
                <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-gold">
                  {section.label}
                </p>
              ) : null}
              {section.heading ? (
                <h2 className="mt-3 font-heading text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {section.heading}
                </h2>
              ) : null}
              <div className="section-divider-duo mt-4" aria-hidden />
              {section.paragraph ? (
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
                  {section.paragraph}
                </p>
              ) : null}
            </div>
            <div className="rounded-3xl bg-warm-white p-6 text-heading shadow-glow sm:p-8">
              <NewsletterSignup />
            </div>
          </div>
        </section>
      );

    case "inquiry":
      return (
        <section
          key={section.id}
          id="get-started"
          className="border-t border-border-subtle bg-warm-cream py-16 sm:py-20"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="text-left">
                {section.label ? (
                  <Badge variant="accent" className="mb-4">
                    {section.label}
                  </Badge>
                ) : null}
                {section.heading ? (
                  <h2 className="font-heading text-3xl font-bold text-charcoal sm:text-4xl">
                    {section.heading}
                  </h2>
                ) : null}
                <div className="section-divider-duo mt-4" aria-hidden />
                {section.paragraph ? (
                  <p className="mt-6 text-lg leading-relaxed text-charcoal/80">
                    {section.paragraph}
                  </p>
                ) : null}
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
      );

    default:
      return null;
  }
}

export function usesHomePresentation(section: Section): boolean {
  return (
    section.type === "richText" ||
    section.type === "cardGrid" ||
    section.type === "textImage" ||
    section.type === "photoCards" ||
    section.type === "academy" ||
    section.type === "insights" ||
    section.type === "experts" ||
    section.type === "newsletter" ||
    section.type === "inquiry"
  );
}
