"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchPublishedInsights, mergeInsights } from "@/lib/content";
import {
  INSIGHTS,
  categoriesWithArticles,
  getCategoryLabel,
  type InsightArticle,
} from "@/lib/insights";
import { SITE_CONTACT } from "@/lib/nav";

export function HomeInsightsShowcase({
  label,
  heading,
  paragraph,
  buttonLabel,
  buttonHref,
}: {
  label?: string;
  heading?: string;
  paragraph?: string;
  buttonLabel?: string;
  buttonHref?: string;
}) {
  const [articles, setArticles] = useState<InsightArticle[]>(INSIGHTS);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedInsights()
      .then((remote) => {
        if (!cancelled) setArticles(mergeInsights(INSIGHTS, remote));
      })
      .catch(() => {
        /* keep static fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = categoriesWithArticles();
  const featured = articles[0];
  const more = articles.slice(1, 4);
  const viewAllHref = buttonHref || "/insights";
  const viewAllLabel = buttonLabel || "View all insights →";

  return (
    <section className="relative overflow-hidden bg-background py-20 sm:py-24">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            {label ? <Badge variant="accent">{label}</Badge> : null}
            {heading ? (
              <h2 className="mt-4 font-heading text-3xl font-bold text-brand-navy sm:text-4xl">
                {heading}
              </h2>
            ) : null}
            <div className="section-divider-duo mt-4" aria-hidden />
            {paragraph ? (
              <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ) : null}

            <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4">
              <div>
                <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                  {articles.length}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  Published articles
                </p>
              </div>
              <div>
                <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                  {categories.length}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  Active topics
                </p>
              </div>
              <div>
                <p className="font-heading text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
                  {featured?.readMinutes ?? 8}
                </p>
                <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                  Min. typical read
                </p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="rounded-full bg-warm-cream px-3 py-1 font-heading text-[11px] font-semibold text-brand-navy"
                >
                  {category.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            {featured ? (
              <Link
                href={`/insights/${featured.slug}`}
                className="group relative block min-h-[280px] overflow-hidden rounded-3xl bg-charcoal sm:min-h-[380px] lg:min-h-[480px]"
              >
                <div
                  className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold"
                  aria-hidden
                />
                <Image
                  src="/consulting_backgroung.jpeg"
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8">
                  <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-gold">
                    {getCategoryLabel(featured.category)} · {featured.readMinutes} min read
                  </p>
                  <h3 className="mt-3 font-heading text-2xl font-bold leading-snug text-white sm:text-3xl">
                    {featured.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75">
                    {featured.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-gold">
                    Read article
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                Published briefings
              </p>
              <h3 className="mt-2 font-heading text-2xl font-bold text-brand-navy">
                More from Insights
              </h3>
            </div>
            <Link
              href={viewAllHref}
              className="text-sm font-semibold text-brand-orange hover:text-brand-orange-dark"
            >
              {viewAllLabel}
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((article) => (
              <article key={article.slug} className="rounded-2xl bg-surface px-5 py-6 shadow-sm">
                <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-brand-orange">
                  {getCategoryLabel(article.category)}
                </p>
                <h3 className="mt-3 font-heading text-base font-bold leading-snug text-brand-navy">
                  <Link
                    href={`/insights/${article.slug}`}
                    className="hover:underline decoration-brand-orange/50 underline-offset-4"
                  >
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {article.description}
                </p>
                <Link
                  href={`/insights/${article.slug}`}
                  className="mt-4 inline-block text-xs font-semibold text-brand-orange hover:text-brand-orange-dark"
                >
                  Read article →
                </Link>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl bg-charcoal px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Confidential consultation
              </p>
              <h3 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                Need advice on a live matter?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                These articles are general guidance. For a suspected fraud,
                integrity issue, or evidence problem, speak with LEAF-C
                confidentially.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-3 sm:max-w-xs">
              <Button href="/get-started" variant="accent" size="lg" className="w-full">
                Request a consultation
              </Button>
              <Link
                href={`mailto:${SITE_CONTACT.email}`}
                className="text-center text-sm text-white/70 hover:text-white"
              >
                Or email {SITE_CONTACT.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
