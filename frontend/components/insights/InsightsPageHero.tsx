"use client";

import { Button } from "@/components/ui/Button";
import { CmsHold } from "@/components/cms/CmsHold";
import { PageHero } from "@/components/layout/PageHero";
import { usePublishedCmsPage } from "@/components/cms/usePublishedCms";
import { resolveCmsAssetUrl } from "@/lib/cms/api";

const FALLBACK = {
  badge: "Insights",
  title: "Guidance for integrity, investigations, and financial crime",
  description:
    "LEAF-C publishes practical commentary for boards, counsel, and operators. These articles are written to be used.",
  imageSrc: "/consulting_backgroung.jpeg",
  buttonLabel: "Request a consultation",
  buttonHref: "/get-started",
};

export function InsightsPageHero() {
  const { content, loaded } = usePublishedCmsPage("insights");
  const hero = content?.sections.find((section) => section.type === "hero");

  const badge = hero && "label" in hero ? hero.label || FALLBACK.badge : FALLBACK.badge;
  const title =
    hero && "heading" in hero && hero.heading ? hero.heading : FALLBACK.title;
  const description =
    hero && "paragraph" in hero && hero.paragraph
      ? hero.paragraph
      : FALLBACK.description;
  const imageSrc =
    hero && "mediaUrl" in hero && hero.mediaUrl
      ? resolveCmsAssetUrl(hero.mediaUrl) || hero.mediaUrl
      : FALLBACK.imageSrc;
  const buttonLabel =
    hero && "primaryCta" in hero && hero.primaryCta?.label
      ? hero.primaryCta.label
      : FALLBACK.buttonLabel;
  const buttonHref =
    hero && "primaryCta" in hero && hero.primaryCta?.href
      ? hero.primaryCta.href
      : FALLBACK.buttonHref;

  // Hold (no built-in copy) until published content arrives or the API is slow.
  if (!loaded) {
    return <CmsHold className="min-h-[360px]" />;
  }

  return (
    <PageHero
      badge={badge}
      title={title}
      description={description}
      imageSrc={imageSrc}
      actions={
        <Button href={buttonHref} variant="accent" size="md">
          {buttonLabel}
        </Button>
      }
    />
  );
}
