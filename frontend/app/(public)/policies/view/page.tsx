"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CmsPolicyView } from "@/components/cms/CmsPolicyView";
import { PageLoader } from "@/components/ui/LogoLoader";

function PolicyByQuery() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-heading text-2xl font-bold text-brand-navy">Policy not found</h1>
      </div>
    );
  }
  return <CmsPolicyView slug={slug} />;
}

export default function PolicyViewPage() {
  return (
    <Suspense fallback={<PageLoader label="Loading policy…" />}>
      <PolicyByQuery />
    </Suspense>
  );
}
