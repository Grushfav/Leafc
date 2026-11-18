import type { ReactNode } from "react";

/**
 * Neutral placeholder shown while published CMS content loads, so the
 * built-in (fallback) copy never flashes before the real content.
 */
export function CmsHold({ className = "min-h-[70vh]" }: { className?: string }) {
  return (
    <div
      className={className}
      role="status"
      aria-busy="true"
      aria-label="Loading page content"
    />
  );
}

/** Fades content in once it replaces a hold placeholder. */
export function CmsFadeIn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`cms-fade-in ${className}`.trim()}>{children}</div>;
}
