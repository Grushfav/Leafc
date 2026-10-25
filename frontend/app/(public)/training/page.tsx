"use client";

import Image from "next/image";
import Link from "next/link";
import { useDivisionPage } from "@/components/divisions/useDivisionPage";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardBody,
} from "@/components/ui/Card";
import { CollapsibleInquiry } from "@/components/forms/CollapsibleInquiry";
import { ServiceInquiryForm } from "@/components/forms/ServiceInquiryForm";
import { AcademyCourseGrid } from "@/components/academy/AcademyCourseGrid";

export default function TrainingPage() {
  const content = useDivisionPage("training");

  return (
    <>
      <section className="relative overflow-hidden bg-charcoal text-white">
        <Image
          src="/training_background.jpeg"
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
          <Badge variant="accent" className="mb-4">{content.heroBadge}</Badge>
          <h1 className="hero-heading text-4xl font-bold sm:text-5xl">
            {content.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/80">
            {content.heroIntro}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {content.highlights.map((f) => (
              <div key={f} className="rounded-lg border border-brand-navy/25 bg-brand-navy/10 px-3 py-2 text-center text-xs backdrop-blur-sm">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="section-divider-duo shrink-0" aria-hidden />
          <h2 id="courses" className="font-heading text-2xl font-bold text-brand-navy">
            {content.introTitle}
          </h2>
        </div>
        <div className="mt-5 grid max-w-5xl gap-5 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <AcademyCourseGrid variant="training" />

        <div className="mt-12 grid items-start gap-8 lg:grid-cols-12">
          <CollapsibleInquiry
            title={content.inquiryTitle}
            description={content.inquiryDescription}
            className="lg:col-span-8"
          >
            <ServiceInquiryForm initialServiceInterest="training" />
          </CollapsibleInquiry>

          <div className="space-y-6 lg:col-span-4">
            <Card variant="callout">
              <CardBody>
                <h3 className="font-heading font-semibold text-heading">
                  {content.asideTitle}
                </h3>
                <div className="section-divider-duo mt-2" aria-hidden />
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {content.asideBody}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {content.badges.map((badge, index) => (
                    <Badge key={badge} variant={index === 0 ? "accent" : "muted"}>
                      {badge}
                    </Badge>
                  ))}
                </div>
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
