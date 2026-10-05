import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getCategoryLabel, type InsightArticle } from "@/lib/insights";

export function InsightArticleView({
  article,
  related = [],
}: {
  article: InsightArticle;
  related?: InsightArticle[];
}) {
  const categoryLabel = getCategoryLabel(article.category);

  return (
    <>
      <article>
        <header className="border-b border-border-subtle bg-warm-cream">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/insights" className="hover:text-brand-navy hover:underline">
                Insights
              </Link>
              <span aria-hidden className="px-2">
                /
              </span>
              <span>{categoryLabel}</span>
            </nav>
            <Badge variant="outline-navy" className="mt-5">
              {categoryLabel}
            </Badge>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-brand-navy sm:text-4xl">
              {article.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-brand-navy/80 sm:text-lg">
              {article.description}
            </p>
            <p className="mt-4 font-heading text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {article.date} · {article.readMinutes} min read
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          {article.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-heading text-xl font-bold text-brand-navy">
                {section.heading}
              </h2>
              <div className="section-divider-duo mt-2" aria-hidden />
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {section.bullets ? (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}

          {article.takeaways.length > 0 ? (
            <section className="rounded-2xl border border-brand-orange/20 bg-warm-cream/80 p-6">
              <h2 className="font-heading text-lg font-bold text-brand-navy">
                Key takeaways
              </h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {article.takeaways.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white"
                      aria-hidden
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            This article is practical guidance for organisations. It is not
            legal advice and does not create a client relationship. For a live
            matter,{" "}
            <Link
              href="/get-started"
              className="font-medium text-brand-navy underline underline-offset-2"
            >
              request a confidential consultation
            </Link>
            .
          </p>

          <div className="flex flex-wrap gap-3">
            <Button href={article.relatedHref} variant="accent" size="md">
              Related service: {article.relatedLabel}
            </Button>
            <Button href="/insights" variant="outline" size="md">
              All insights
            </Button>
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="border-t border-border-subtle bg-warm-cream py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-heading text-xl font-bold text-brand-navy">
              More in {categoryLabel}
            </h2>
            <ul className="mt-6 space-y-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/insights/${item.slug}`}
                    className="font-heading text-sm font-semibold text-brand-navy hover:underline decoration-brand-orange/50 underline-offset-4"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
