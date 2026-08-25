import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const variants = {
  default: "bg-charcoal text-white",
  accent: "bg-accent text-accent-foreground",
  outline: "border border-charcoal/30 bg-transparent text-charcoal",
  "outline-accent":
    "border border-brand-bronze/45 bg-warm-cream/60 text-brand-navy",
  muted: "bg-warm-cream text-muted-foreground",
  success: "bg-success/10 text-success border border-success/20",
  warning: "bg-warning/10 text-warning border border-warning/20",
  navy: "bg-brand-navy text-white",
  "outline-navy":
    "border border-brand-navy/30 bg-brand-navy/5 text-brand-navy",
} as const;

export type BadgeVariant = keyof typeof variants;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5",
        "font-heading text-xs font-semibold uppercase tracking-wide",
        "transition-colors duration-150",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
