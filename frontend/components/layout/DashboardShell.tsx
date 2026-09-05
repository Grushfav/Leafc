"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { isStaffRole, roleLabel } from "@/lib/auth";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
}

export function DashboardShell({
  children,
  title,
  description,
  toolbar,
}: DashboardShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

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
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                pathname === "/dashboard"
                  ? "border-l-2 border-brand-orange bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal shadow-sm"
                  : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
              )}
            >
              Overview
            </Link>
            <Link
              href="/dashboard/profile"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                pathname === "/dashboard/profile"
                  ? "border-l-2 border-brand-orange bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal shadow-sm"
                  : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
              )}
            >
              Profile
            </Link>
            {user && isStaffRole(user.role) ? (
              <>
                <Link
                  href="/dashboard/cases"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname.startsWith("/dashboard/cases")
                      ? "border-l-2 border-brand-orange bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal shadow-sm"
                      : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
                  )}
                >
                  Cases
                </Link>
                <Link
                  href="/dashboard/training"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    pathname.startsWith("/dashboard/training")
                      ? "border-l-2 border-brand-orange bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal shadow-sm"
                      : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
                  )}
                >
                  Training
                </Link>
              </>
            ) : null}
            <Link
              href="/get-started"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-warm-cream hover:text-brand-navy"
            >
              Service inquiry
            </Link>
          </nav>

          {user ? (
            <div className="mt-8 rounded-2xl border border-border-subtle bg-warm-cream/70 p-3">
              <div className="flex items-center gap-3">
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-semibold text-heading">
                    {user.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {roleLabel(user.role)}
                    {isStaffRole(user.role) ? " · Member" : ""}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {(title || description || toolbar) && (
          <div className="border-b border-border-subtle bg-surface px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="section-divider-duo mt-2 shrink-0" aria-hidden />
                <div>
                  {title && (
                    <h1 className="font-heading text-2xl font-bold text-heading">
                      {title}
                    </h1>
                  )}
                  {description && (
                    <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              {toolbar ? <div className="lg:pt-0.5">{toolbar}</div> : null}
            </div>
          </div>
        )}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
