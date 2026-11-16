"use client";

import Image from "next/image";
import Link from "next/link";
import { AcademyCourseGrid } from "@/components/academy/AcademyCourseGrid";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import { ExpertContactLinks } from "@/components/experts/ExpertContactLinks";
import { ExpertPhotoPlaceholder } from "@/components/experts/ExpertPhotoPlaceholder";
import {
  DEFAULT_HERO_VIDEO_MP4,
  DEFAULT_HERO_VIDEO_WEBM,
  HomeHero,
} from "@/components/layout/HomeHero";
import {
  renderHomeSection,
  usesHomePresentation,
} from "@/components/cms/homeSectionPresentation";
import { HomeInsightsShowcase } from "@/components/insights/HomeInsightsShowcase";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { resolveCmsAssetUrl } from "@/lib/cms/api";
import type { CmsPageSlug, ExpertDraft, PageContent, Section } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

function isVideoHero(section: Extract<Section, { type: "hero" }>) {
  if (section.mediaType === "video") return true;
  const url = section.mediaUrl ?? "";
  return /\.(webm|mp4)(\?|$)/i.test(url);
}

function mediaSrc(url?: string) {
  return resolveCmsAssetUrl(url);
}

function SectionIntro({
  label,
  heading,
  paragraph,
}: {
  label?: string;
  heading?: string;
  paragraph?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {label ? (
        <Badge className="mb-3">{label}</Badge>
      ) : null}
      {heading ? (
        <h2 className="font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
          {heading}
        </h2>
      ) : null}
      {paragraph ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {paragraph}
        </p>
      ) : null}
    </div>
  );
}

function ExpertsBlock({
  section,
  experts,
}: {
  section: Extract<Section, { type: "experts" }>;
  experts: ExpertDraft[];
}) {
  const visible = experts.filter((expert) => expert.published);
  return (
    <section className="bg-warm-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          label={section.label}
          heading={section.heading}
          paragraph={section.paragraph}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((expert) => {
            const photo = mediaSrc(expert.photoUrl ?? undefined);
            return (
              <article
                key={expert.slug}
                className="flex h-full flex-col items-center rounded-2xl border border-border-subtle bg-surface px-6 py-8 text-center"
              >
                <ExpertPhotoPlaceholder
                  name={expert.name}
                  portrait={expert.portrait ?? "male"}
                  photoSrc={photo}
                  fit="cover"
                  className="h-32 w-32 sm:h-36 sm:w-36"
                />
                <h3 className="mt-5 font-heading text-lg font-semibold text-brand-navy">
                  {expert.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{expert.title}</p>
                {expert.summary ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                    {expert.summary}
                  </p>
                ) : null}
                <div className="mt-4">
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
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function renderSection(
  section: Section,
  experts: ExpertDraft[],
  slug?: CmsPageSlug,
) {
  if (slug === "home" && usesHomePresentation(section)) {
    const home = renderHomeSection(section, experts);
    if (home) return home;
  }

  switch (section.type) {
    case "hero":
      if (isVideoHero(section)) {
        const customVideo = mediaSrc(section.mediaUrl);
        return (
          <HomeHero
            key={section.id}
            label={section.label}
            heading={section.heading}
            paragraph={section.paragraph}
            primaryCta={section.primaryCta}
            secondaryCta={section.secondaryCta}
            videoSrc={customVideo ?? DEFAULT_HERO_VIDEO_WEBM}
            videoSrcMp4={
              customVideo && /\.mp4(\?|$)/i.test(customVideo)
                ? customVideo
                : DEFAULT_HERO_VIDEO_MP4
            }
          />
        );
      }
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-brand-navy text-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(173,140,83,0.25),transparent_45%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              {section.label ? (
                <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">
                  {section.label}
                </p>
              ) : null}
              <h1 className="mt-4 font-heading text-4xl font-bold tracking-tight sm:text-5xl">
                {section.heading}
              </h1>
              {section.paragraph ? (
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
                  {section.paragraph}
                </p>
              ) : null}
              <div className="mt-8 flex flex-wrap gap-3">
                {section.primaryCta ? (
                  <Button href={section.primaryCta.href} variant="primary">
                    {section.primaryCta.label}
                  </Button>
                ) : null}
                {section.secondaryCta ? (
                  <Button href={section.secondaryCta.href} variant="secondary">
                    {section.secondaryCta.label}
                  </Button>
                ) : null}
              </div>
            </div>
            {section.mediaUrl ? (
              <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                <Image
                  src={mediaSrc(section.mediaUrl) ?? section.mediaUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : null}
          </div>
        </section>
      );
    case "richText":
      return (
        <section key={section.id} className="bg-warm-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              label={section.label}
              heading={section.heading}
            />
            <div className="mt-8 space-y-4 text-base leading-relaxed text-foreground/85">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.id}-p-${index}`}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      );
    case "textImage": {
      const image = mediaSrc(section.image);
      return (
        <section key={section.id} className="bg-warm-cream/40 py-16 sm:py-20">
          <div
            className={cn(
              "mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8",
              section.imagePosition === "left" && "lg:[&>*:first-child]:order-2",
            )}
          >
            <div>
              <SectionIntro
                label={section.label}
                heading={section.heading}
                paragraph={section.paragraph}
              />
            </div>
            {image ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-subtle">
                <Image
                  src={image}
                  alt={section.imageAlt ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            ) : null}
          </div>
        </section>
      );
    }
    case "cardGrid": {
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
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-background py-20 sm:py-24"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              label={section.label}
              heading={section.heading}
              paragraph={section.paragraph}
            />
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
                      {card.body ? (
                        <p className="mb-2 text-sm leading-relaxed text-muted-foreground">
                          {card.body}
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
    case "photoCards":
      return (
        <section key={section.id} className="bg-warm-cream/50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              label={section.label}
              heading={section.heading}
              paragraph={section.paragraph}
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {section.cards.map((card) => {
                const image = mediaSrc(card.image);
                return (
                  <article
                    key={card.id}
                    className="overflow-hidden rounded-2xl border border-border-subtle bg-surface"
                  >
                    <div className="relative aspect-[4/3] bg-warm-cream">
                      {image ? (
                        <Image
                          src={image}
                          alt={card.imageAlt ?? card.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : null}
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-semibold text-brand-navy">
                        {card.title}
                      </h3>
                      {card.subtitle ? (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {card.subtitle}
                        </p>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    case "experts":
      return <ExpertsBlock key={section.id} section={section} experts={experts} />;
    case "cta":
      return (
        <section key={section.id} className="bg-brand-navy py-16 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              {section.heading}
            </h2>
            {section.paragraph ? (
              <p className="mt-4 text-white/80">{section.paragraph}</p>
            ) : null}
            <div className="mt-8">
              <Button href={section.buttonHref} variant="primary">
                {section.buttonLabel}
              </Button>
            </div>
          </div>
        </section>
      );
    case "inquiry":
      return (
        <section key={section.id} className="bg-warm-white py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <SectionIntro
              label={section.label}
              heading={section.heading}
              paragraph={section.paragraph}
            />
            <div className="mt-8 rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8">
              <ServiceInquiryForm />
            </div>
          </div>
        </section>
      );
    case "academy":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-charcoal py-20 text-white sm:py-24"
        >
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div>
              {section.label ? (
                <Badge variant="accent" className="shadow-sm">
                  {section.label}
                </Badge>
              ) : null}
              {section.heading ? (
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  {section.heading}
                </h2>
              ) : null}
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
    case "newsletter":
      return (
        <section
          key={section.id}
          className="relative overflow-hidden bg-brand-navy py-20 text-white sm:py-24"
        >
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
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
    case "divisionLayout":
      return null;
    default:
      return null;
  }
}

export function SectionRenderer({
  content,
  experts = [],
  slug,
}: {
  content: PageContent;
  experts?: ExpertDraft[];
  /** When `home`, section backgrounds and text alignment use fixed design chrome. */
  slug?: CmsPageSlug;
}) {
  return (
    <div>
      {content.sections.map((section) => renderSection(section, experts, slug))}
    </div>
  );
}
