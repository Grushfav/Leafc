"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";
import { ExpertPhotoPlaceholder } from "@/components/experts/ExpertPhotoPlaceholder";
import { ExpertContactLinks } from "@/components/experts/ExpertContactLinks";
import { CmsHold } from "@/components/cms/CmsHold";
import { useCmsExpertsState } from "@/components/cms/usePublishedCms";
import {
  EXPERTS,
  getPublishedExperts,
  mergeExperts,
} from "@/lib/experts";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.net";

export function ExpertsPageContent() {
  const { experts: remote, status } = useCmsExpertsState();
  // Hold until published experts arrive so the built-in list never flashes first.
  if (status === "loading") return <CmsHold />;
  // null = loading/error → local fallback; [] = CMS says none published → show none
  const published =
    remote == null
      ? getPublishedExperts()
      : mergeExperts(EXPERTS, remote).filter((expert) => expert.published);
  const featured = published[0];

  const jsonLd = featured
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: featured.name,
        jobTitle: featured.title,
        worksFor: {
          "@type": "Organization",
          name: "LEAF-C",
          url: siteUrl,
        },
        description: featured.summary,
        url: new URL("/experts", siteUrl).toString(),
        ...(featured.photoSrc
          ? { image: new URL(featured.photoSrc, siteUrl).toString() }
          : {}),
      }
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <PageHero
        badge="Leadership"
        title="Our Experts"
        description="The professionals who lead LEAF-C’s investigations, training, and integrity work."
        imageSrc="/consulting_backgroung.jpeg"
        actions={
          <Button href="/get-started" variant="accent" size="md">
            Request a consultation
          </Button>
        }
      />

      {featured ? (
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8">
            <div className="flex justify-center lg:col-span-3 lg:justify-start">
              <ExpertPhotoPlaceholder
                name={featured.name}
                portrait={featured.portrait}
                photoSrc={featured.photoSrc}
                fit="cover"
                className="h-36 w-36 sm:h-44 sm:w-44"
              />
            </div>
            <div className="lg:col-span-9">
              <Badge variant="outline-navy">{featured.title}</Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                {featured.name}
              </h2>
              <div className="section-divider-duo mt-4" aria-hidden />
              <ExpertContactLinks expert={featured} className="mt-5 justify-start" />
              {featured.summary ? (
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  {featured.summary}
                </p>
              ) : null}

              {featured.specialistAreas && featured.specialistAreas.length > 0 ? (
                <div className="mt-8">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    Specialist areas
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {featured.specialistAreas.map((area) => (
                      <li
                        key={area}
                        className="rounded-full border border-brand-navy/15 bg-warm-cream/80 px-3 py-1 text-xs font-medium text-brand-navy"
                      >
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {featured.experience && featured.experience.length > 0 ? (
                <div className="mt-8">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">
                    Relevant experience
                  </h3>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {featured.experience.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                {featured.qualifications && featured.qualifications.length > 0 ? (
                  <div>
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      Qualifications
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {featured.qualifications.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {featured.memberships && featured.memberships.length > 0 ? (
                  <div>
                    <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-brand-orange">
                      Professional credentials
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                      {featured.memberships.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {published.length > 1 ? (
        <section className="border-t border-border-subtle bg-warm-cream py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
              Leadership
            </h2>
            <div className="section-divider-duo mt-4" aria-hidden />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {published.slice(1).map((expert) => (
                <article
                  key={expert.slug}
                  className="flex h-full flex-col items-center rounded-2xl bg-surface px-6 py-8 text-center"
                >
                  <ExpertPhotoPlaceholder
                    name={expert.name}
                    portrait={expert.portrait}
                    photoSrc={expert.photoSrc}
                    fit="cover"
                    className="h-32 w-32 sm:h-36 sm:w-36"
                  />
                  <h3 className="mt-5 font-heading text-lg font-bold text-brand-navy">
                    {expert.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {expert.title}
                  </p>
                  <ExpertContactLinks expert={expert} className="mt-4" />

                  {expert.summary ? (
                    <p className="mt-5 w-full text-left text-sm leading-relaxed text-muted-foreground">
                      {expert.summary}
                    </p>
                  ) : null}

                  {expert.specialistAreas &&
                  expert.specialistAreas.length > 0 ? (
                    <div className="mt-6 w-full text-left">
                      <h4 className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        Specialist areas
                      </h4>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {expert.specialistAreas.map((area) => (
                          <li
                            key={area}
                            className="rounded-full border border-brand-navy/15 bg-warm-cream/80 px-3 py-1 text-xs font-medium text-brand-navy"
                          >
                            {area}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {expert.experience && expert.experience.length > 0 ? (
                    <div className="mt-6 w-full text-left">
                      <h4 className="font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-orange">
                        Relevant experience
                      </h4>
                      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                        {expert.experience.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
