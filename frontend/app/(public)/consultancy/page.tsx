"use client";

import Image from "next/image";
import Link from "next/link";
import { useDivisionPage } from "@/components/divisions/useDivisionPage";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { CollapsibleInquiry } from "@/components/forms/CollapsibleInquiry";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import {
  IconAlert,
  IconBuilding,
  IconClipboard,
  IconFile,
  IconSearch,
} from "@/components/icons/MonoIcons";

const serviceIcons = [IconClipboard, IconBuilding, IconAlert, IconFile, IconSearch];

export default function ConsultancyPage() {
  const content = useDivisionPage("consultancy");

  return (
    <>
      {/* Division Hero — charcoal + orange accent */}
      <section className="relative overflow-hidden bg-charcoal text-white">
        <Image
          src="/consulting_backgroung.jpeg"
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
          <Badge variant="accent" className="mb-4 animate-fade-in-up">
            {content.heroBadge}
          </Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl animate-fade-in-up animate-delay-1">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80 animate-fade-in-up animate-delay-2">
            {content.heroIntro}
          </p>
        </div>
      </section>

      {/* Process timeline */}
      <section className="border-b border-border-subtle bg-warm-cream py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-lg font-semibold text-heading">{content.introTitle}</h2>
          <div className="mt-5 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            {content.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
            {content.steps.map((step, index) => (
              <div key={step.title} className="relative min-w-0 rounded-xl border border-border-subtle bg-surface p-2.5 sm:p-4 lg:p-5 hover-lift">
                <span className="font-heading text-lg font-bold text-brand-orange/30 sm:text-2xl lg:text-3xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 font-heading text-xs font-semibold text-heading sm:mt-2 sm:text-sm lg:text-base">{step.title}</h3>
                <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground sm:mt-1 sm:text-xs lg:text-sm">{step.body}</p>
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
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-5">
          {content.items.map((service, index) => {
            const Icon = serviceIcons[index % serviceIcons.length];
            return (
            <Card key={service.title} className="h-full">
              <CardBody className="flex flex-col items-start gap-2 px-3 py-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-navy/20 bg-brand-navy/10 text-brand-navy"
                  aria-hidden
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-medium leading-snug">{service.title}</span>
              </CardBody>
            </Card>
            );
          })}
        </div>

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <CollapsibleInquiry
            title={content.inquiryTitle}
            description={content.inquiryDescription}
            className="lg:col-span-8"
          >
            <ServiceInquiryForm initialServiceInterest="consultancy" />
          </CollapsibleInquiry>

          <div className="space-y-6 lg:col-span-4">
            <Card variant="callout">
              <CardBody>
                <Badge variant="accent" className="mb-3">{content.asideTitle}</Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {content.asideBody}
                </p>
              </CardBody>
            </Card>

            <Link href="/get-started" className="block text-center text-sm font-medium text-brand-orange hover:underline">
              {content.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
