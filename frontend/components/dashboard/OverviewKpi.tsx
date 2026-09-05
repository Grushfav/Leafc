import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const accentClass = {
  orange: "kpi-accent-orange",
  gold: "kpi-accent-gold",
  charcoal: "kpi-accent-charcoal",
  navy: "kpi-accent-navy",
} as const;

export function OverviewKpiGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {children}
    </div>
  );
}

interface KpiMetricProps {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
  accent: keyof typeof accentClass;
  featured?: boolean;
}

export function KpiMetric({
  label,
  value,
  hint,
  href,
  accent,
  featured = false,
}: KpiMetricProps) {
  const className = cn(
    "block overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-card",
    accentClass[accent],
    featured && "ring-1 ring-brand-navy/10",
    href &&
      "transition-colors duration-150 hover:bg-warm-cream/70 focus-visible:bg-warm-cream/70",
  );

  const body = (
    <>
      {featured ? (
        <div
          className="h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
          aria-hidden
        />
      ) : null}
      <div className="px-5 py-4">
        <p className="font-heading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-1.5 font-heading font-bold tabular-nums text-heading",
            featured ? "text-3xl" : "text-[1.75rem] leading-none",
          )}
        >
          {value}
        </p>
        {hint ? (
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

export function KpiCallout({
  label,
  children,
  href,
  hrefLabel,
}: {
  label: string;
  children: ReactNode;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-brand-orange/25 bg-gradient-to-br from-warm-cream to-surface shadow-card">
      <div className="px-5 py-4">
        <p className="font-heading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-navy">
          {label}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {children}
        </p>
        <Link
          href={href}
          className="mt-3 inline-block font-heading text-sm font-semibold text-brand-orange hover:underline"
        >
          {hrefLabel}
        </Link>
      </div>
    </div>
  );
}
