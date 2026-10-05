"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/auth/UserAvatar";
import { isAdminRole, isStaffRole, roleLabel } from "@/lib/auth";

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
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const onOverview = pathname === "/dashboard" && hash !== "#incoming-inquiries";
  const onInquiries = pathname === "/dashboard" && hash === "#incoming-inquiries";
  const staff = Boolean(user && isStaffRole(user.role));
  const admin = Boolean(user && isAdminRole(user.role));

  const links = [
    { href: "/dashboard", label: "Overview", active: onOverview, onClick: () => setHash("") },
    { href: "/dashboard/profile", label: "Profile", active: pathname === "/dashboard/profile" },
    staff
      ? {
          href: "/dashboard/cases",
          label: "Cases",
          active: pathname.startsWith("/dashboard/cases"),
        }
      : null,
    staff
      ? {
          href: "/dashboard/training",
          label: "Training",
          active: pathname.startsWith("/dashboard/training"),
        }
      : null,
    admin
      ? {
          href: "/dashboard/insights",
          label: "Insights",
          active: pathname.startsWith("/dashboard/insights"),
        }
      : null,
    admin
      ? {
          href: "/dashboard/academy",
          label: "Academy",
          active: pathname.startsWith("/dashboard/academy"),
        }
      : null,
    {
      href: "/dashboard#incoming-inquiries",
      label: "Service inquiries",
      active: onInquiries,
      onClick: () => {
        setHash("#incoming-inquiries");
        window.location.hash = "incoming-inquiries";
        document
          .getElementById("incoming-inquiries")
          ?.scrollIntoView({ behavior: "smooth" });
      },
    },
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  function linkClass(active: boolean, compact = false) {
    if (compact) {
      return cn(
        "shrink-0 rounded-full px-3 py-2 text-sm font-medium",
        active
          ? "bg-brand-navy text-white"
          : "bg-warm-cream text-brand-navy hover:bg-brand-orange/15",
      );
    }
    return cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
      active
        ? "border-l-2 border-brand-orange bg-gradient-to-r from-brand-orange/15 to-brand-gold/10 text-charcoal shadow-sm"
        : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
    );
  }

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
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                className={linkClass(item.active)}
              >
                {item.label}
              </Link>
            ))}
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
        <nav
          className="border-b border-border-subtle bg-surface px-4 py-2 lg:hidden"
          aria-label="Dashboard"
        >
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.onClick}
                className={linkClass(item.active, true)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        {(title || description || toolbar) && (
          <div className="border-b border-border-subtle bg-surface px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
              {toolbar ? <div className="lg:pt-0.5">{toolbar}</div> : null}
            </div>
          </div>
        )}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
