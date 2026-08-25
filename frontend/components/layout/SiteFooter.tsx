import Link from "next/link";

const footerLinks = {
  divisions: [
    { href: "/consultancy", label: "Consultancy" },
    { href: "/operations", label: "Operations" },
    { href: "/training", label: "Training" },
    { href: "/polygraph", label: "Polygraph Unit" },
  ],
  company: [
    { href: "/get-started", label: "Get Started" },
    { href: "/dashboard", label: "Client Portal" },
  ],
  governance: [
    { href: "#", label: "Privacy Policy" },
    { href: "#", label: "Data Protection" },
    { href: "#", label: "Ethics & Compliance" },
    { href: "#", label: "Audit Standards" },
  ],
};

const trustBadges = [
  "ISO-Aligned",
  "Internationally Compliant",
  "Encrypted Data",
  "Independent Oversight",
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-charcoal text-white">
      {/* Navy-to-orange accent band */}
      <div className="h-1 bg-gradient-to-r from-brand-navy via-brand-orange to-brand-gold" aria-hidden />

      {/* Partner / trust strip */}
      <div className="border-b border-white/10 bg-charcoal-light">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 sm:gap-10 sm:px-6 lg:px-8">
          {trustBadges.map((badge) => (
            <span
              key={badge}
              className="flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-wider text-white/70"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange/20 text-brand-orange text-[10px]" aria-hidden>
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
              <p className="font-heading text-xl font-bold">
                LEAF-C
              </p>
              <div className="section-divider-duo mt-3" aria-hidden />
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/75">
                Law Enforcement Assistance & Forensic Consultancy — delivering
                investigative excellence and compliance solutions for public and
                private sector clients worldwide.
              </p>
            </div>

            <div>
              <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-brand-orange">
                Divisions
              </h3>
              <ul className="mt-4 space-y-2">
                {footerLinks.divisions.map((link) => (
                  <li key={link.href}>
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
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
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
                {footerLinks.governance.map((link) => (
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
              Global operations · ISO-aligned processes · Encrypted document
              handling
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
