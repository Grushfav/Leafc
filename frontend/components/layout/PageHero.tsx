import Image from "next/image";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

type PageHeroProps = {
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  imageClassName?: string;
  actions?: ReactNode;
  children?: ReactNode;
  priority?: boolean;
};

export function PageHero({
  badge,
  title,
  description,
  imageSrc,
  imageAlt = "",
  imageClassName = "object-cover object-center",
  actions,
  children,
  priority = true,
}: PageHeroProps) {
  return (
    <section className="relative min-h-[442px] overflow-hidden bg-charcoal sm:min-h-[493px]">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        className={imageClassName}
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-warm-white/95 from-0% via-warm-white/75 via-[38%] to-transparent to-[58%]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pt-[5.1rem] pb-[4.25rem] sm:px-6 sm:pt-[6.8rem] sm:pb-[5.1rem] lg:px-8">
        <div className="max-w-2xl animate-fade-in-up rounded-2xl bg-warm-white/80 p-5 shadow-lg sm:p-7 lg:max-w-xl">
          <Badge variant="accent" className="mb-5">
            {badge}
          </Badge>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-navy/80 sm:text-lg">
            {description}
          </p>
          {actions ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
