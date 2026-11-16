"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { fetchPublishedSiteNotice } from "@/lib/cms/api";
import type { PublishedSiteNotice } from "@/lib/cms/types";

const STORAGE_PREFIX = "leafc.siteNotice.dismissed.";

function isDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(`${STORAGE_PREFIX}${id}`) === "1";
  } catch {
    return false;
  }
}

function markDismissed(id: string) {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, "1");
  } catch {
    /* ignore */
  }
}

export function SiteNoticePopup() {
  const [notice, setNotice] = useState<PublishedSiteNotice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPublishedSiteNotice()
      .then((remote) => {
        if (cancelled || !remote) return;
        if (isDismissed(remote.id)) return;
        setNotice(remote);
        setOpen(true);
      })
      .catch(() => {
        /* keep silent on public site */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    if (notice) markDismissed(notice.id);
    setOpen(false);
  }

  if (!open || !notice) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-charcoal/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-notice-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl sm:p-6">
        <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-orange">
          Notice
        </p>
        <h2
          id="site-notice-title"
          className="mt-2 font-heading text-xl font-bold text-brand-navy"
        >
          {notice.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {notice.message}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button type="button" variant="accent" size="sm" onClick={dismiss}>
            {notice.dismissLabel || "Got it"}
          </Button>
          {notice.linkHref && notice.linkLabel ? (
            <Link
              href={notice.linkHref}
              className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-heading font-semibold text-brand-navy underline-offset-2 hover:underline"
              onClick={dismiss}
            >
              {notice.linkLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
