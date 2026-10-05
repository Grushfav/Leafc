import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SITE_CONTACT, SITE_EXPANSION } from "@/lib/nav";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://leafc.net";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "LEAF-C",
  alternateName: SITE_EXPANSION,
  url: siteUrl,
  email: SITE_CONTACT.email,
  telephone: SITE_CONTACT.phoneDisplay,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kingston",
    addressCountry: "JM",
  },
};

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteHeader />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
