"use client";

import { useEffect, useState } from "react";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";
import { PageLoader } from "@/components/ui/LogoLoader";
import { fetchPublishedPolicy } from "@/lib/cms/api";
import type { PolicyDocument } from "@/lib/cms/types";

function renderBody(body: string) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isList = lines.length > 0 && lines.every((line) => line.startsWith("- "));
    if (isList) {
      return (
        <ul key={index} className="list-disc space-y-2 pl-5">
          {lines.map((line) => (
            <li key={line}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }
    return <p key={index}>{block}</p>;
  });
}

export function CmsPolicyView({
  slug,
  fallback,
}: {
  slug: string;
  fallback?: PolicyDocument | null;
}) {
  const [policy, setPolicy] = useState<PolicyDocument | null>(fallback ?? null);
  const [loading, setLoading] = useState(!fallback);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublishedPolicy(slug)
      .then((remote) => {
        if (!cancelled) {
          setPolicy(remote ?? fallback ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPolicy(fallback ?? null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [slug, fallback]);

  if (loading && !policy) {
    return <PageLoader label="Loading policy…" />;
  }

  if (!policy) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-navy">Policy not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This governance page is not published yet.
        </p>
      </div>
    );
  }

  return (
    <PolicyPage
      badge={policy.badge || "Governance"}
      title={policy.title}
      description={policy.description}
      updated={policy.updated}
    >
      {policy.sections.map((section) => (
        <PolicySection key={section.id} title={section.title}>
          {renderBody(section.body)}
        </PolicySection>
      ))}
    </PolicyPage>
  );
}
