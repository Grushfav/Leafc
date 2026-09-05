import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const cardVariants = {
  default:
    "rounded-xl border border-border-subtle bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md",
  featured:
    [
      "relative overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-card hover-lift",
      "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-brand-orange before:to-brand-gold",
      "after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1 after:bg-gradient-to-b after:from-brand-orange after:via-brand-orange/60 after:to-brand-orange/20",
    ].join(" "),
  elevated:
    "rounded-3xl border border-border-subtle bg-surface shadow-card hover-lift ring-1 ring-black/[0.04]",
  dark:
    "rounded-3xl border border-charcoal-light bg-charcoal text-white shadow-lg",
  kpi:
    "rounded-3xl border border-border-subtle bg-surface shadow-card hover-lift overflow-hidden",
  callout:
    "rounded-3xl border border-brand-orange/25 bg-gradient-to-br from-warm-cream to-surface shadow-sm",
} as const;

export type CardVariant = keyof typeof cardVariants;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <div className={cn(cardVariants[variant], className)} {...props} />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-border-subtle px-6 py-4", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-heading text-lg font-semibold text-heading", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 py-5", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border-subtle px-6 py-4",
        className,
      )}
      {...props}
    />
  );
}
