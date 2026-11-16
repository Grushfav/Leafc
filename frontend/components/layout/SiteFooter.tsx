"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  usePublishedFooter,
  usePublishedNav,
  usePublishedPolicies,
} from "@/components/cms/usePublishedCms";
import { DIVISION_LINKS, SITE_CONTACT, SITE_EXPANSION, SOCIAL_LINKS } from "@/lib/nav";
import { policyPublicPath } from "@/lib/cms/types";
import {
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconTikTok,
} from "@/components/icons/MonoIcons";

const socialIcons: Record<string, typeof IconInstagram> = {
  Instagram: IconInstagram,
  TikTok: IconTikTok,
  LinkedIn: IconLinkedIn,
  Facebook: IconFacebook,
};

const defaultCompany = [
  { href: "/about", label: "About us" },
  { href: "/insights", label: "Insights" },
  { href: "/experts", label: "Our Experts" },
  { href: "/training", label: "Programmes" },
  { href: "/get-started", label: "Get Started" },
  { href: "/login", label: "Staff sign in" },
];

const defaultGovernance = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/data-protection", label: "Data Protection" },
  { href: "/terms", label: "Terms and Conditions" },
];

export function SiteFooter() {
  const cmsFooter = usePublishedFooter();
  const cmsNav = usePublishedNav();
  const cmsPolicies = usePublishedPolicies();

  const blurb = cmsFooter?.blurb ?? `${SITE_EXPANSION} — delivering investigative excellence and compliance solutions for public and private sector clients worldwide.`;
  const location = cmsFooter?.location ?? SITE_CONTACT.location;
  const phoneDisplay = cmsFooter?.phoneDisplay ?? SITE_CONTACT.phoneDisplay;
  const phoneHref = cmsFooter?.phoneHref ?? SITE_CONTACT.phoneHref;
  const email = cmsFooter?.email ?? SITE_CONTACT.email;
  const trustBadges = cmsFooter?.trustBadges?.length
    ? cmsFooter.trustBadges
    : ["ISO-Aligned", "Internationally Compliant", "Encrypted Data", "Independent Oversight"];
  const social = cmsFooter?.social?.length
    ? cmsFooter.social
    : SOCIAL_LINKS.map((item) => ({
        id: item.label,
        label: item.label,
        href: item.href,
      }));
  const company = useMemo(() => {
    if (cmsFooter?.companyLinks?.length) {
      return cmsFooter.companyLinks.filter((item) => item.visible);
    }
    return defaultCompany;
  }, [cmsFooter]);
  const governance = useMemo(() => {
    if (cmsPolicies?.length) {
      return cmsPolicies.map((policy) => ({
        href: policyPublicPath(policy.slug),
        label: policy.title,
      }));
    }
    return defaultGovernance;
  }, [cmsPolicies]);
  const divisions = useMemo(() => {
    if (cmsNav?.divisions?.length) {
      return cmsNav.divisions.filter((item) => item.visible);
    }
    return DIVISION_LINKS;
  }, [cmsNav]);

  return (
    <footer className="mt-auto bg-charcoal text-white">
      <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold" aria-hidden />

      <div className="border-b border-white/10 bg-charcoal-light">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 sm:gap-10 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/70"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange/20 text-[10px] text-brand-orange"
                aria-hidden
              >
                ✓
              </span>
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="pattern-grid">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <p className="font-heading text-xl font-bold">LEAF-C</p>
              <div className="section-divider-duo mt-3" aria-hidden />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">{blurb}</p>
              <address className="mt-5 not-italic text-sm text-white/75">
                <p>{location}</p>
                <p className="mt-1">
                  <a
                    href={phoneHref}
                    className="transition-colors hover:text-white hover:underline underline-offset-2"
                  >
                    {phoneDisplay}
                  </a>
                </p>
                <p className="mt-1">
                  <a
                    href={`mailto:${email}`}
                    className="transition-colors hover:text-white hover:underline underline-offset-2"
                  >
                    {email}
                  </a>
                </p>
              </address>
              <ul className="mt-5 flex items-center gap-2">
                {social.map((item) => {
                  const Icon = socialIcons[item.label] ?? IconLinkedIn;
                  return (
                    <li key={item.id ?? item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-brand-gold/50 hover:text-brand-gold"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brand-orange">
                Divisions
              </h3>
              <ul className="mt-4 space-y-2">
                {divisions.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors duration-150 hover:text-white hover:underline decoration-brand-navy/60 underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brand-orange">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                {company.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors duration-150 hover:text-white hover:underline decoration-brand-navy/60 underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brand-orange">
                Governance
              </h3>
              <ul className="mt-4 space-y-2">
                {governance.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/75 transition-colors duration-150 hover:text-white hover:underline decoration-brand-navy/60 underline-offset-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/60">
              © {new Date().getFullYear()} LEAF-C. All rights reserved.
            </p>
            <p className="text-xs text-white/60">
              Global operations · ISO-aligned processes · Encrypted document handling
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
