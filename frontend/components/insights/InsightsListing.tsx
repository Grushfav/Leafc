"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchPublishedInsights, insightHref, mergeInsights } from "@/lib/content";
import {
  INSIGHTS,
  categoriesWithArticles,
  getCategoryLabel,
  insightsInCategory,
  type InsightArticle,
} from "@/lib/insights";

export function InsightsListing() {
  const [articles, setArticles] = useState<InsightArticle[]>(INSIGHTS);
  const [remoteSlugs, setRemoteSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchPublishedInsights()
      .then((remote) => {
        setRemoteSlugs(new Set(remote.map((article) => article.slug)));
        setArticles(mergeInsights(INSIGHTS, remote));
      })
      .catch(() => {
        setArticles(INSIGHTS);
      });
  }, []);

  const populatedCategories = useMemo(
    () => categoriesWithArticles(articles),
    [articles],
  );
  const featured = articles[0];

  function hrefFor(slug: string) {
    return insightHref(slug, remoteSlugs.has(slug) && !INSIGHTS.some((item) => item.slug === slug));
  }

  return (
    <>
      {featured ? (
        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-orange">
                  Featured briefing
                </p>
                <h2 className="mt-3 font-heading text-3xl font-bold text-brand-navy">
                  Latest from Insights
                </h2>
                <div className="section-divider-duo mt-4" aria-hidden />
                <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
                  Short briefings on fraud, integrity testing, digital evidence,
                  and financial-crime risk for boards, counsel, and
                  investigators.
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3 rounded-2xl border border-border-subtle bg-surface px-4 py-4">
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-brand-navy">
                      {articles.length}
                    </p>
                    <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Articles
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-brand-navy">
                      {populatedCategories.length}
                    </p>
                    <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Topics
                    </p>
                  </div>
                  <div>
                    <p className="font-heading text-2xl font-extrabold text-brand-navy">
                      {featured.readMinutes}
                    </p>
                    <p className="mt-1 font-heading text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-orange">
                      Min. read
                    </p>
                  </div>
                </div>
                <nav className="mt-6 flex flex-wrap gap-2" aria-label="Insight categories">
                  {populatedCategories.map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="rounded-full bg-warm-cream px-3 py-1.5 font-heading text-[11px] font-semibold text-brand-navy hover:bg-brand-orange/15"
                    >
                      {category.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="lg:col-span-7">
                <Link
                  href={hrefFor(featured.slug)}
                  className="group relative block min-h-[280px] overflow-hidden rounded-3xl bg-charcoal sm:min-h-[380px] lg:min-h-[460px]"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-transparent" aria-hidden />
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
                      Read article →
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-16 px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        {populatedCategories.map((category) => {
          const categoryArticles = insightsInCategory(category.id, articles);
          return (
            <section key={category.id} id={category.id} className="scroll-mt-24">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <Badge variant="outline-navy">{category.label}</Badge>
                  <h2 className="mt-3 font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
                    {category.label}
                  </h2>
                  <div className="section-divider-duo mt-3" aria-hidden />
                </div>
                <p className="text-sm text-muted-foreground">
                  {categoryArticles.length}{" "}
                  {categoryArticles.length === 1 ? "article" : "articles"}
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {categoryArticles.map((article) => (
                  <article
                    key={article.slug}
                    className="flex flex-col rounded-2xl bg-surface px-5 py-6 shadow-sm"
                  >
                    <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-brand-orange">
                      {article.date} · {article.readMinutes} min read
                    </p>
                    <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-brand-navy">
                      <Link
                        href={hrefFor(article.slug)}
                        className="hover:underline decoration-brand-orange/50 underline-offset-4"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {article.description}
                    </p>
                    <Link
                      href={hrefFor(article.slug)}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:text-brand-orange-dark"
                    >
                      Read article
                      <span aria-hidden>→</span>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-charcoal px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="font-heading text-[11px] font-bold uppercase tracking-[0.16em] text-brand-gold">
                Confidential consultation
              </p>
              <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
                Need advice on a live matter?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                These articles are general guidance. If you are dealing with a
                suspected fraud, integrity issue, or evidence problem, speak
                with LEAF-C confidentially.
              </p>
            </div>
            <Button href="/get-started" variant="accent" size="lg">
              Request a consultation
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
