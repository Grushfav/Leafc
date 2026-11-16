"use client";

import { useEffect, useState } from "react";
import type { CmsPageSlug } from "@/lib/cms/types";
import { PUBLIC_PATH_BY_SLUG } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

export const PREVIEW_PANE_STORAGE_KEY = "leafc.cms.previewPaneOpen";

export function readPreviewPaneOpen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(PREVIEW_PANE_STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

export function writePreviewPaneOpen(open: boolean) {
  try {
    window.localStorage.setItem(PREVIEW_PANE_STORAGE_KEY, open ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function PreviewPane({
  slug,
  reloadToken,
  onHide,
  className,
}: {
  slug: CmsPageSlug;
  /** Change after Save to force iframe reload. */
  reloadToken: number;
  onHide?: () => void;
  className?: string;
}) {
  const href = `${PUBLIC_PATH_BY_SLUG[slug]}?preview=1`;
  const [src, setSrc] = useState(href);

  useEffect(() => {
    const sep = href.includes("?") ? "&" : "?";
    setSrc(`${href}${sep}_r=${reloadToken}`);
  }, [href, reloadToken]);

  return (
    <div
      className={cn(
        "hidden overflow-hidden rounded-xl border border-border-subtle bg-white lg:flex lg:flex-col",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle bg-warm-cream px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-navy">
          Live preview
        </p>
        <div className="flex items-center gap-3">
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-brand-navy underline"
          >
            Open in new tab
          </a>
          {onHide ? (
            <button
              type="button"
              onClick={onHide}
              className="text-xs font-medium text-muted-foreground hover:text-brand-navy"
            >
              Hide
            </button>
          ) : null}
        </div>
      </div>
      <iframe
        key={src}
        title={`Preview ${slug}`}
        src={src}
        className="min-h-[70vh] w-full flex-1 bg-white"
      />
    </div>
  );
}
