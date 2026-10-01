import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";
import {
  categoriesWithArticles,
  insightsInCategory,
} from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical guidance from LEAF-C on procurement fraud, polygraph examinations, digital evidence, Speak Up programmes, background checks, and Caribbean financial-crime risk.",
  openGraph: {
    title: "LEAF-C Insights",
    description:
      "Articles and guidance for organisations managing integrity, investigations, and financial crime risk.",
    url: "/insights",
    type: "website",
  },
  alternates: {
    canonical: "/insights",
  },
};

export default function InsightsPage() {
  const populatedCategories = categoriesWithArticles();

  return (
    <>
      <PageHero
        badge="Insights"
        title="Guidance for integrity, investigations, and financial crime"
        description="LEAF-C publishes practical commentary for boards, counsel, and operators. These articles are written to be used — not to advertise a product."
        imageSrc="/consulting_backgroung.jpeg"
        actions={
          <Link href="/get-started">
            <Button variant="accent" size="md">
              Request a consultation
            </Button>
          </Link>
        }
      />

      <section className="border-b border-border-subtle bg-warm-cream/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Topics with published guidance
          </p>
          <nav
            className="mt-3 flex flex-wrap gap-2"
            aria-label="Insight categories"
          >
            {populatedCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full border border-brand-navy/15 bg-surface px-3 py-1.5 font-heading text-xs font-semibold text-brand-navy transition-colors hover:border-brand-orange/40 hover:bg-warm-cream"
              >
                {category.label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {populatedCategories.map((category) => {
          const articles = insightsInCategory(category.id);
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
                  {articles.length} {articles.length === 1 ? "article" : "articles"}
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.slug}
                    className="flex flex-col rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-brand-orange">
                      {article.date} · {article.readMinutes} min read
                    </p>
                    <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-brand-navy">
                      <Link
                        href={`/insights/${article.slug}`}
                        className="hover:underline decoration-brand-orange/50 underline-offset-4"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                      {article.description}
                    </p>
                    <Link
                      href={`/insights/${article.slug}`}
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

      <section className="border-t border-border-subtle bg-warm-cream py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold text-brand-navy sm:text-3xl">
            Need advice on a live matter?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            These articles are general guidance. If you are dealing with a
            suspected fraud, integrity issue, or evidence problem, speak with
            LEAF-C confidentially.
          </p>
          <div className="mt-8">
            <Link href="/get-started">
              <Button variant="accent" size="lg">
                Request a consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
