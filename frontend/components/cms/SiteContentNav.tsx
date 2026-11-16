"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  canAccessMenusFooter,
  canAccessSitePages,
  canEditSiteContent,
  hasPermission,
} from "@/lib/auth";
import { cn } from "@/lib/utils";

export type SiteContentSecondaryTab = {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

type SiteContentNavProps = {
  secondaryTabs?: SiteContentSecondaryTab[];
};

function primaryTabClass(active: boolean) {
  return cn(
    "shrink-0 border-b-2 px-3 py-2 text-sm font-heading font-semibold transition-colors",
    active
      ? "border-brand-navy text-brand-navy"
      : "border-transparent text-muted-foreground hover:border-brand-navy/30 hover:text-brand-navy",
  );
}

function secondaryTabClass(active: boolean) {
  return cn(
    "shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
    active
      ? "bg-brand-navy text-white"
      : "text-muted-foreground hover:bg-warm-cream hover:text-brand-navy",
  );
}

function actionLinkClass(active: boolean) {
  return cn(
    "shrink-0 rounded-md border px-2.5 py-1.5 text-sm font-medium transition-colors",
    active
      ? "border-brand-navy/40 bg-warm-cream text-brand-navy"
      : "border-border-subtle bg-transparent text-muted-foreground hover:border-brand-navy/30 hover:text-brand-navy",
  );
}

export function SiteContentNav({ secondaryTabs }: SiteContentNavProps = {}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const primary = [
    canAccessSitePages(user) || canAccessMenusFooter(user)
      ? {
          href: "/dashboard/site-content",
          label: "Website",
          match: "/dashboard/site-content",
          exact: true,
        }
      : null,
    hasPermission(user, "canEditPages")
      ? {
          href: "/dashboard/policies",
          label: "Policies",
          match: "/dashboard/policies",
          exact: false,
        }
      : null,
    hasPermission(user, "canEditPages")
      ? {
          href: "/dashboard/divisions",
          label: "Divisions",
          match: "/dashboard/divisions",
          exact: false,
        }
      : null,
    hasPermission(user, "canViewNewsletter")
      ? {
          href: "/dashboard/newsletter",
          label: "Newsletter",
          match: "/dashboard/newsletter",
          exact: false,
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  const actions = [
    hasPermission(user, "canManageInsights") || hasPermission(user, "canEditPages")
      ? {
          href: "/dashboard/insights",
          label: "Add insight",
          match: "/dashboard/insights",
        }
      : null,
    hasPermission(user, "canManageAcademy") || hasPermission(user, "canEditPages")
      ? {
          href: "/dashboard/academy",
          label: "Add academy course",
          match: "/dashboard/academy",
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null);

  if (!user || (!canEditSiteContent(user) && primary.length === 0 && actions.length === 0)) {
    return null;
  }

  const showSecondary = Boolean(secondaryTabs && secondaryTabs.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {primary.length > 0 ? (
          <nav
            className="-mx-1 flex gap-1 overflow-x-auto px-1"
            aria-label="Site content areas"
          >
            {primary.map((link) => {
              const active = link.exact
                ? pathname === link.match
                : pathname.startsWith(link.match);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={primaryTabClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <div />
        )}

        {actions.length > 0 ? (
          <div
            className="-mx-1 flex flex-wrap gap-2 px-1 sm:justify-end"
            aria-label="Content shortcuts"
          >
            {actions.map((link) => {
              const active = pathname.startsWith(link.match);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={actionLinkClass(active)}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>

      {showSecondary ? (
        <nav
          className="-mx-1 flex gap-1 overflow-x-auto border-t border-border-subtle px-1 pt-3"
          aria-label="Website sections"
        >
          {secondaryTabs!.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={tab.onClick}
              className={secondaryTabClass(tab.active)}
              aria-current={tab.active ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
