"use client";

import Image from "next/image";
import Link from "next/link";
import { useDivisionPage } from "@/components/divisions/useDivisionPage";
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

const sessionIcons = [IconUser, IconScale, IconPulse, IconSearch];
const suitableIcons = [IconUser, IconSearch, IconClipboard];

export default function PolygraphPage() {
  const content = useDivisionPage("polygraph");

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
            {content.heroBadge}
          </Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            {content.heroIntro}
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl border border-brand-navy/30 bg-brand-navy/10 px-5 py-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-brand-navy text-white"
              aria-hidden
            >
              <IconScale className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{content.certifiedTitle}</p>
              <p className="text-xs text-white/60">
                {content.certifiedBody}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border-subtle bg-warm-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-lg font-semibold text-heading">
            {content.introTitle}
          </h2>
          <div className="mt-5 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4 sm:max-w-xl">
            {content.stats.map((stat) => (
              <div key={stat.title}>
                <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                  {stat.title}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  {stat.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {content.steps.map((step, index) => (
              <div
                key={step.title}
                className="relative min-w-0 rounded-xl border border-border-subtle bg-surface p-2.5 sm:p-4"
              >
                <span className="font-heading text-lg font-bold text-brand-orange/30 sm:text-2xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-heading text-xs font-semibold text-heading sm:text-sm">
                  {step.title}
                </h3>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:text-xs">
                  {step.body}
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
            {content.listTitle}
          </h2>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {content.items.map((type, index) => {
            const Icon = sessionIcons[index % sessionIcons.length];
            return (
            <Card key={type.title}>
              <CardBody className="flex items-start gap-3 px-4 py-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                  aria-hidden
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-heading">
                    {type.title}
                  </h3>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {type.body}
                  </p>
                </div>
              </CardBody>
            </Card>
            );
          })}
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
                  {content.photoTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/90"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-white/65">
                  {content.photoCaption}
                </p>
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <h2 className="font-heading text-xl font-bold text-brand-navy">
              {content.witnessTitle}
            </h2>
            <div className="section-divider-duo mt-3" aria-hidden />
            {content.witnessParagraphs.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "mt-4 text-sm leading-relaxed text-muted-foreground" : "mt-3 text-sm leading-relaxed text-muted-foreground"}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-heading text-xl font-bold text-brand-navy">
            {content.suitableTitle}
          </h2>
          <div className="section-divider-duo mt-3" aria-hidden />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {content.suitable.map((item, index) => {
              const Icon = suitableIcons[index % suitableIcons.length];
              return (
              <Card key={item.title}>
                <CardBody className="px-4 py-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                    aria-hidden
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <h3 className="mt-3 font-heading text-sm font-semibold text-heading">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {item.body}
                  </p>
                </CardBody>
              </Card>
              );
            })}
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
                  {content.cautionTitle}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {content.cautionIntro}
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                  {content.cautionItems.map((item) => (
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
              {content.protocolTitle}
            </h3>
            <div className="section-divider-duo mt-2" aria-hidden />
            <ul className="mt-4 space-y-3">
              {content.protocols.map((item) => (
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
              Examiner credentials: {content.credentials}.
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
                {content.guideTitle}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {content.guideBody}
              </p>
            </div>
          </div>
          <Button
            href="/insights/when-an-organization-should-consider-a-polygraph-examination"
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {content.guideLabel}
          </Button>
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <Card variant="featured" className="lg:col-span-8">
            <CardHeader>
              <CardTitle>{content.inquiryTitle}</CardTitle>
              <CardDescription>
                {content.inquiryDescription}
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
                  {content.asideTitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {content.asideBody}
                </p>
              </CardBody>
            </Card>

            <Link
              href="/get-started"
              className="block text-center text-sm font-medium text-brand-orange hover:underline"
            >
              {content.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
