"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { UserAvatar } from "@/components/auth/UserAvatar";
import {
  canEditSiteContent,
  hasPermission,
  isAdminRole,
  isStaffRole,
  roleLabel,
} from "@/lib/auth";

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  toolbar?: React.ReactNode;
  /** `beside` keeps actions to the right of the title; `below` stacks a full-width toolbar under it. */
  toolbarPlacement?: "beside" | "below";
}

export function DashboardShell({
  children,
  title,
  description,
  toolbar,
  toolbarPlacement = "beside",
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
  const admin = Boolean(user && isAdminRole(user.role));
  const siteEditor = Boolean(user && canEditSiteContent(user));
  const canNewsletter = Boolean(user && hasPermission(user, "canViewNewsletter"));
  const canInsights = Boolean(user && hasPermission(user, "canManageInsights"));
  const canAcademy = Boolean(user && hasPermission(user, "canManageAcademy"));
  const useHorizontalNav = pathname.startsWith("/dashboard/site-content");

  const links = [
    { href: "/dashboard", label: "Overview", active: onOverview, onClick: () => setHash("") },
    { href: "/dashboard/profile", label: "Profile", active: pathname === "/dashboard/profile" },
    siteEditor
      ? {
          href: "/dashboard/site-content",
          label: "Site content",
          active:
            pathname.startsWith("/dashboard/site-content") ||
            pathname.startsWith("/dashboard/policies") ||
            pathname.startsWith("/dashboard/divisions"),
        }
      : null,
    canNewsletter && !siteEditor
      ? {
          href: "/dashboard/newsletter",
          label: "Newsletter",
          active: pathname.startsWith("/dashboard/newsletter"),
        }
      : null,
    canInsights
      ? {
          href: "/dashboard/insights",
          label: "Add insight",
          active: pathname.startsWith("/dashboard/insights"),
        }
      : null,
    canAcademy
      ? {
          href: "/dashboard/academy",
          label: "Add academy course",
          active: pathname.startsWith("/dashboard/academy"),
        }
      : null,
    admin
      ? {
          href: "/dashboard/users",
          label: "Users",
          active: pathname.startsWith("/dashboard/users"),
        }
      : null,
    admin
      ? {
          href: "/dashboard/activity",
          label: "Activity",
          active: pathname.startsWith("/dashboard/activity"),
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

  const userBlock = user ? (
    <div className="flex shrink-0 items-center gap-2.5">
      <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-8 w-8" />
      <div className="min-w-0">
        <p className="truncate font-heading text-sm font-semibold text-heading">
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {roleLabel(user.role)}
          {isStaffRole(user.role) ? " · Member" : ""}
        </p>
      </div>
    </div>
  ) : null;

  const pageHeader =
    title || description || toolbar ? (
      <div className="border-b border-border-subtle bg-surface px-5 py-4 sm:px-6">
        {toolbarPlacement === "below" ? (
          <div className="space-y-4">
            <div className="min-w-0">
              {title ? (
                <h1 className="font-heading text-2xl font-bold text-heading">{title}</h1>
              ) : null}
              {description ? (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {toolbar ? <div className="min-w-0">{toolbar}</div> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              {title ? (
                <h1 className="font-heading text-2xl font-bold text-heading">{title}</h1>
              ) : null}
              {description ? (
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {toolbar ? <div className="lg:pt-0.5">{toolbar}</div> : null}
          </div>
        )}
      </div>
    ) : null;

  if (useHorizontalNav) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-warm-white">
        <div className="border-b border-border-subtle bg-surface">
          <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1" aria-label="Workspace">
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
            </nav>
            {userBlock}
          </div>
        </div>

        {pageHeader}

        <div className="p-5 sm:p-6">{children}</div>
      </div>
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
        {pageHeader}
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
