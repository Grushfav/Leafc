"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { resolveCmsAssetUrl } from "@/lib/cms/api";
import { cn } from "@/lib/utils";

export type GallerySlide = {
  id: string;
  image?: string;
  imageAlt?: string;
  title?: string;
  subtitle?: string;
};

export function PhotoCoverflowGallery({
  label,
  heading,
  paragraph,
  slides,
}: {
  label?: string;
  heading?: string;
  paragraph?: string;
  slides: GallerySlide[];
}) {
  const items = useMemo(
    () => slides.filter((slide) => Boolean(slide.image)),
    [slides],
  );
  const [active, setActive] = useState(0);

  if (!items.length) return null;

  const count = items.length;
  const go = (direction: -1 | 1) => {
    setActive((current) => (current + direction + count) % count);
  };

  return (
    <section className="relative overflow-hidden bg-warm-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {label ? (
            <p className="font-heading text-xs font-bold uppercase tracking-[0.18em] text-brand-orange">
              {label}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-brand-navy sm:text-4xl">
              {heading}
            </h2>
          ) : null}
          {paragraph ? (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {paragraph}
            </p>
          ) : null}
        </div>

        <div className="relative mx-auto mt-12 h-[340px] max-w-5xl sm:h-[420px] lg:h-[480px]">
          {items.map((slide, index) => {
            const offset = index - active;
            const wrapped =
              offset > count / 2
                ? offset - count
                : offset < -count / 2
                  ? offset + count
                  : offset;
            const abs = Math.abs(wrapped);
            if (abs > 2) return null;

            const scale = abs === 0 ? 1 : abs === 1 ? 0.86 : 0.72;
            const translateX = wrapped * 58;
            const z = 30 - abs * 10;
            const opacity = abs === 0 ? 1 : abs === 1 ? 0.78 : 0.55;
            const src = resolveCmsAssetUrl(slide.image) ?? slide.image!;

            return (
              <button
                key={slide.id}
                type="button"
                aria-label={slide.title || slide.imageAlt || `Photo ${index + 1}`}
                onClick={() => setActive(index)}
                className={cn(
                  "absolute left-1/2 top-1/2 h-[88%] w-[48%] max-w-[320px] overflow-hidden rounded-2xl bg-charcoal shadow-xl ring-1 ring-black/5 transition-all duration-500 ease-out sm:w-[40%] lg:max-w-[340px]",
                  abs === 0 ? "cursor-default" : "cursor-pointer",
                )}
                style={{
                  transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                  zIndex: z,
                  opacity,
                }}
              >
                <Image
                  src={src}
                  alt={slide.imageAlt || slide.title || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 55vw, 300px"
                  priority={abs === 0}
                />
                {abs > 0 ? (
                  <div className="absolute inset-0 bg-charcoal/25" aria-hidden />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/30 text-charcoal transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-charcoal/30 text-charcoal transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            →
          </button>
        </div>

        {items[active]?.title ? (
          <p className="mt-5 text-center font-heading text-sm font-semibold text-brand-navy">
            {items[active].title}
          </p>
        ) : null}
      </div>
    </section>
  );
}
