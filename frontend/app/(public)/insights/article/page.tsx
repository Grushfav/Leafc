"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { InsightArticleView } from "@/components/insights/InsightArticleView";
import { PageLoader } from "@/components/ui/LogoLoader";
import { fetchPublishedInsight } from "@/lib/content";
import { getInsight, relatedInsights, type InsightArticle } from "@/lib/insights";

function InsightByQuery() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  const [article, setArticle] = useState<InsightArticle | null>(
    slug ? getInsight(slug) ?? null : null,
  );
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    slug ? "loading" : "missing",
  );

  useEffect(() => {
    if (!slug) {
      setStatus("missing");
      return;
    }

    fetchPublishedInsight(slug)
      .then((remote) => {
        setArticle(remote);
        setStatus("ready");
      })
      .catch(() => {
        const fallback = getInsight(slug);
        setArticle(fallback ?? null);
        setStatus(fallback ? "ready" : "missing");
      });
  }, [slug]);

  if (status === "loading") {
    return <PageLoader label="Loading article…" />;
  }

  if (status === "missing" || !article) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-bold text-brand-navy">
          Article not found
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This insight is unavailable or is not published yet.
        </p>
        <Link
          href="/insights"
          className="mt-6 inline-block font-medium text-brand-orange hover:underline"
        >
          Back to Insights
        </Link>
      </section>
    );
  }

  return (
    <InsightArticleView
      article={article}
      related={relatedInsights(article)}
    />
  );
}

export default function InsightArticleClientPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading article…" />}>
      <InsightByQuery />
    </Suspense>
  );
}
