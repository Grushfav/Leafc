"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CommonTasks({
  onEditHomeHeadline,
  onUpdatePersonPhoto,
}: {
  onEditHomeHeadline: () => void;
  onUpdatePersonPhoto: () => void;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-warm-cream/60 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
        Common tasks
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEditHomeHeadline}>
          Change homepage headline
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onUpdatePersonPhoto}>
          Update a person’s photo
        </Button>
        <Link
          href="/dashboard/insights"
          className="inline-flex h-8 items-center rounded-lg border-2 border-charcoal px-3 text-sm font-heading font-semibold text-charcoal hover:bg-charcoal hover:text-white"
        >
          Edit Insights articles
        </Link>
        <Link
          href="/dashboard/academy"
          className="inline-flex h-8 items-center rounded-lg border-2 border-charcoal px-3 text-sm font-heading font-semibold text-charcoal hover:bg-charcoal hover:text-white"
        >
          Edit Academy courses
        </Link>
      </div>
    </div>
  );
}
