import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface WorkQueueEmpty {
  message: string;
  actionHref?: string;
  actionLabel?: string;
}

interface WorkQueueProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
  empty?: WorkQueueEmpty | null;
  columns?: string[];
  columnClassName?: string;
  children?: ReactNode;
}

export function WorkQueue({
  id,
  eyebrow = "Queue",
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
  loading = false,
  loadingLabel = "Loading…",
  empty,
  columns,
  columnClassName,
  children,
}: WorkQueueProps) {
  return (
    <section
      id={id}
      className={cn(
        "overflow-hidden rounded-3xl border border-border-subtle bg-surface shadow-card",
        id && "scroll-mt-24",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="font-heading text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand-navy">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-heading text-lg font-semibold text-heading">
            {title}
          </h2>
          <div className="section-divider-duo mt-2" aria-hidden />
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="shrink-0 font-heading text-sm font-semibold text-brand-orange hover:underline"
          >
            {viewAllLabel}
          </Link>
        ) : null}
      </header>

      {columns && !loading && !empty ? (
        <div
          className={cn(
            "hidden border-t border-border-subtle bg-warm-cream/60 px-5 py-2 font-heading text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground sm:px-6 lg:grid",
            columnClassName,
          )}
        >
          {columns.map((column, index) => (
            <span
              key={column}
              className={index === columns.length - 1 ? "text-right" : undefined}
            >
              {column}
            </span>
          ))}
        </div>
      ) : null}

      <div className="border-t border-border-subtle">
        {loading ? (
          <p className="px-5 py-8 text-sm text-muted-foreground sm:px-6">
            {loadingLabel}
          </p>
        ) : empty ? (
          <div className="px-5 py-8 sm:px-6">
            <p className="text-sm text-muted-foreground">{empty.message}</p>
            {empty.actionHref && empty.actionLabel ? (
              <Link
                href={empty.actionHref}
                className="mt-3 inline-block font-heading text-sm font-semibold text-brand-orange hover:underline"
              >
                {empty.actionLabel}
              </Link>
            ) : null}
          </div>
        ) : (
          <ul>{children}</ul>
        )}
      </div>
    </section>
  );
}

interface QueueRowShellProps {
  href?: string;
  className?: string;
  children: ReactNode;
}

function QueueRowShell({ href, className, children }: QueueRowShellProps) {
  const rowClass = cn(
    "grid items-start gap-2 border-b border-border-subtle px-5 py-3.5 last:border-b-0 sm:px-6 sm:gap-3",
    href && "transition-colors duration-150 hover:bg-warm-cream/80",
    className,
  );

  if (href) {
    return (
      <li>
        <Link href={href} className={rowClass}>
          {children}
        </Link>
      </li>
    );
  }

  return <li className={rowClass}>{children}</li>;
}

interface CaseQueueRowProps {
  href: string;
  reference: string;
  title: string;
  meta: string;
  status: ReactNode;
  date: string;
}

export function CaseQueueRow({
  href,
  reference,
  title,
  meta,
  status,
  date,
}: CaseQueueRowProps) {
  return (
    <QueueRowShell
      href={href}
      className="lg:grid-cols-[7.25rem_minmax(0,1fr)_auto_5.75rem] lg:items-center"
    >
      <p className="font-mono text-xs text-muted-foreground">{reference}</p>
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-semibold text-heading">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {status}
        <span className="text-xs text-muted-foreground lg:hidden">{date}</span>
      </div>
      <p className="hidden text-right text-xs text-muted-foreground lg:block">
        {date}
      </p>
    </QueueRowShell>
  );
}

interface SessionQueueRowProps {
  title: string;
  meta: string;
  status: ReactNode;
}

export function SessionQueueRow({ title, meta, status }: SessionQueueRowProps) {
  return (
    <QueueRowShell className="lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-semibold text-heading">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {status}
      </div>
    </QueueRowShell>
  );
}

interface InquiryQueueRowProps {
  reference: string;
  title: string;
  meta: string;
  status: ReactNode;
  date: string;
}

export function InquiryQueueRow({
  reference,
  title,
  meta,
  status,
  date,
}: InquiryQueueRowProps) {
  return (
    <QueueRowShell className="lg:grid-cols-[7.25rem_minmax(0,1.1fr)_minmax(0,1fr)_auto_6.5rem] lg:items-center">
      <p className="font-mono text-xs text-muted-foreground">{reference}</p>
      <p className="truncate font-heading text-sm font-semibold text-heading">
        {title}
      </p>
      <p className="truncate text-sm text-muted-foreground">{meta}</p>
      <div className="flex flex-wrap items-center gap-2">
        {status}
        <span className="text-xs text-muted-foreground lg:hidden">{date}</span>
      </div>
      <p className="hidden text-right text-xs text-muted-foreground lg:block">
        {date}
      </p>
    </QueueRowShell>
  );
}
