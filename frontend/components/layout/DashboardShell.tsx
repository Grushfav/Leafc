"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: "◫" },
  { href: "/consultancy", label: "Consultancy", icon: "◎" },
  { href: "/operations", label: "Operations", icon: "⚙" },
  { href: "/training", label: "Training", icon: "▣" },
  { href: "/polygraph", label: "Polygraph", icon: "◉" },
];

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function DashboardShell({
  children,
  title,
  description,
}: DashboardShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-warm-white">
      <aside
        className="hidden w-64 shrink-0 border-r border-border-subtle bg-surface lg:block"
        aria-label="Dashboard navigation"
      >
        <div className="sticky top-16 p-4">
          <p className="px-3 font-heading text-xs font-semibold uppercase tracking-wider text-brand-navy">
            Workspace
          </p>
          <nav className="mt-3 space-y-1">
            {sidebarLinks.map((link) => {
              const active =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal border-l-2 border-brand-orange shadow-sm"
                      : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-sm",
                      active
                        ? "bg-brand-orange text-white"
                        : "bg-warm-cream text-muted-foreground",
                    )}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 overflow-hidden rounded-xl border border-brand-navy/15 bg-gradient-to-br from-warm-cream to-surface shadow-sm">
            <div className="h-0.5 bg-gradient-to-r from-brand-navy to-brand-orange" aria-hidden />
            <div className="p-4">
              <p className="font-heading text-xs font-semibold uppercase tracking-wider text-brand-orange">
                Quick Stats
              </p>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Active cases</dt>
                  <dd className="font-heading font-bold text-brand-orange">24</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pending reports</dt>
                  <dd className="font-heading font-bold text-charcoal">7</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sessions this week</dt>
                  <dd className="font-heading font-bold text-charcoal">8</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        {(title || description) && (
          <div className="border-b border-border-subtle bg-surface px-6 py-6">
            <div className="flex items-start gap-4">
              <div className="section-divider-duo mt-2 shrink-0" aria-hidden />
              <div>
                {title && (
                  <h1 className="font-heading text-2xl font-bold text-heading">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
