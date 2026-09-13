import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";

export function PolicyPage({
  badge,
  title,
  description,
  updated,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="border-b border-border-subtle bg-warm-cream">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <Badge variant="accent">{badge}</Badge>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-navy/80">
            {description}
          </p>
          <p className="mt-4 font-heading text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Effective {updated}
          </p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 [&_a]:font-medium [&_a]:text-brand-navy [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </article>
    </>
  );
}

export function PolicySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-brand-navy">{title}</h2>
      <div className="section-divider-duo mt-2" aria-hidden />
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
