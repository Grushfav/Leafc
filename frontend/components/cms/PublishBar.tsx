"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type PublishStatus = "unsaved" | "saved_draft" | "live";

const STATUS_COPY: Record<PublishStatus, { label: string; className: string }> = {
  unsaved: {
    label: "Unsaved",
    className: "bg-brand-orange/15 text-brand-orange",
  },
  saved_draft: {
    label: "Saved draft (not live)",
    className: "bg-warm-cream text-brand-navy",
  },
  live: {
    label: "Live",
    className: "bg-emerald-100 text-emerald-800",
  },
};

export function PublishBar({
  status,
  busy,
  previewHref,
  onSave,
  onPublish,
  className,
  compactPreviewLink = false,
}: {
  status: PublishStatus;
  busy?: boolean;
  previewHref: string;
  onSave: () => void;
  onPublish: () => void;
  className?: string;
  /** When true, Preview is text-only (desktop split uses the pane). */
  compactPreviewLink?: boolean;
}) {
  const chip = STATUS_COPY[status];

  function handlePublish() {
    const ok = window.confirm(
      "This updates the public website. Make these changes live?",
    );
    if (!ok) return;
    onPublish();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
            chip.className,
          )}
        >
          {chip.label}
        </span>
        <p className="text-xs text-muted-foreground">
          Saving does not change the public website until you Make live.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={onSave} disabled={busy}>
          Save
        </Button>
        <Link
          href={previewHref}
          target="_blank"
          className={
            compactPreviewLink
              ? "text-sm font-medium text-brand-navy underline"
              : "inline-flex h-10 items-center justify-center rounded-lg border-2 border-charcoal px-5 text-sm font-heading font-semibold text-charcoal hover:bg-charcoal hover:text-white"
          }
        >
          Preview
        </Link>
        <Button
          type="button"
          variant="secondary"
          onClick={handlePublish}
          disabled={busy}
        >
          Make live
        </Button>
      </div>
    </div>
  );
}
