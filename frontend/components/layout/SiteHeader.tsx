"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DIVISION_LINKS, PRIMARY_NAV_LINKS, SITE_EXPANSION } from "@/lib/nav";
import { useAuth } from "@/components/auth/AuthProvider";

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isReady, logout } = useAuth();
  const [divisionsOpen, setDivisionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDivisionActive = DIVISION_LINKS.some((d) => pathname.startsWith(d.href));

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface/95 backdrop-blur-md">
      <div className="h-0.5 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold" aria-hidden />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`LEAF-C — ${SITE_EXPANSION}`}
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90 sm:gap-3"
        >
          <Image
            src="/leafc-logo-mark.svg"
            alt=""
            width={43}
            height={48}
            priority
            aria-hidden
            className="h-11 w-auto sm:h-12"
          />
          <div className="leading-none">
            <p className="font-heading text-[0.9375rem] font-bold tracking-[0.08em] text-brand-navy sm:text-base">
              LEAF-<span className="text-brand-gold">C</span>
            </p>
            <p className="mt-0.5 font-heading text-[0.5rem] font-medium uppercase leading-tight tracking-[0.12em] text-brand-navy/85 sm:mt-1 sm:text-[0.5625rem]">
              Law Enforcement Against
            </p>
            <div className="mt-px flex items-center gap-1 sm:mt-0.5">
              <span className="h-px w-2.5 shrink-0 bg-brand-gold sm:w-3" aria-hidden />
              <p className="font-heading text-[0.5rem] font-medium uppercase leading-none tracking-[0.12em] text-brand-navy/85 sm:text-[0.5625rem]">
                Financial Crimes
              </p>
              <span className="h-px w-2.5 shrink-0 bg-brand-gold sm:w-3" aria-hidden />
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 font-heading text-sm font-medium transition-all duration-150",
                pathname === link.href
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-brand-navy/70 hover:bg-warm-cream hover:text-brand-navy",
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="relative">
            <button
              type="button"
              onClick={() => setDivisionsOpen((o) => !o)}
              onBlur={() => setTimeout(() => setDivisionsOpen(false), 150)}
              aria-expanded={divisionsOpen}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 font-heading text-sm font-medium transition-all duration-150",
                isDivisionActive
                  ? "bg-charcoal text-white shadow-sm"
                  : "text-brand-navy/70 hover:bg-warm-cream hover:text-brand-navy",
              )}
            >
              Divisions
              <span className="text-xs" aria-hidden>
                {divisionsOpen ? "▴" : "▾"}
              </span>
            </button>
            {divisionsOpen && (
              <div
                className="absolute right-0 mt-1 w-56 overflow-hidden rounded-xl border border-border-subtle bg-surface py-1 shadow-lg"
                role="menu"
              >
                <div className="h-0.5 bg-gradient-to-r from-brand-navy to-brand-orange" aria-hidden />
                {DIVISION_LINKS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className={cn(
                      "block px-4 py-2.5 text-sm transition-colors duration-150",
                      pathname.startsWith(item.href)
                        ? "bg-warm-cream font-medium text-heading border-l-2 border-brand-orange"
                        : "text-brand-navy/70 hover:bg-warm-cream hover:text-brand-navy",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isReady && user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Workspace
                </Button>
              </Link>
              <Button variant="accent" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="accent" size="sm">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="rounded-lg p-2 text-heading md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border-subtle bg-surface px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 font-heading text-sm font-medium text-brand-navy/70 hover:bg-warm-cream hover:text-brand-navy"
            >
              {link.label}
            </Link>
          ))}
          <p className="mt-3 px-3 font-heading text-xs font-semibold uppercase tracking-wider text-brand-orange">
            Divisions
          </p>
          {DIVISION_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm text-brand-navy/70 hover:bg-warm-cream hover:text-brand-navy"
            >
              {item.label}
            </Link>
          ))}
          {isReady && user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="mt-3 block"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Workspace
                </Button>
              </Link>
              <Button
                variant="accent"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="mt-2 block">
                <Button variant="accent" size="sm" className="w-full">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
