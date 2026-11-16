"use client";

import type { CmsPageSlug, Section } from "@/lib/cms/types";
import { sectionDisplayName } from "@/lib/cms/sectionLabels";
import { cn } from "@/lib/utils";

export function BlockList({
  sections,
  slug,
  selectedId,
  onSelect,
  onMove,
}: {
  sections: Section[];
  slug: CmsPageSlug;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Page blocks
      </p>
      {sections.map((section, index) => {
        const selected = selectedId === section.id;
        return (
          <div
            key={section.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(section.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(section.id);
              }
            }}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-left text-sm",
              selected
                ? "border-brand-orange bg-brand-orange/10"
                : "border-border-subtle hover:bg-warm-cream",
            )}
          >
            <span className="min-w-0 pr-2">
              <span className="text-muted-foreground">{index + 1}. </span>
              {sectionDisplayName(section, slug)}
            </span>
            <span className="flex shrink-0 gap-1">
              <button
                type="button"
                aria-label="Move up"
                className="rounded px-1 text-xs text-muted-foreground hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  if (index === 0) return;
                  onMove(index, -1);
                }}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label="Move down"
                className="rounded px-1 text-xs text-muted-foreground hover:bg-white"
                onClick={(event) => {
                  event.stopPropagation();
                  if (index >= sections.length - 1) return;
                  onMove(index, 1);
                }}
              >
                ↓
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
