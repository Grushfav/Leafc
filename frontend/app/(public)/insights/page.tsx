import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { PageHero } from "@/components/layout/PageHero";
import { InsightsListing } from "@/components/insights/InsightsListing";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Practical guidance from LEAF-C on procurement fraud, polygraph examinations, digital evidence, Speak Up programmes, background checks, and Caribbean financial-crime risk.",
  openGraph: {
    title: "LEAF-C Insights",
    description:
      "Articles and guidance for organisations managing integrity, investigations, and financial crime risk.",
    url: "/insights",
    type: "website",
  },
  alternates: {
    canonical: "/insights",
  },
};

export default function InsightsPage() {
  return (
    <>
      <PageHero
        badge="Insights"
        title="Guidance for integrity, investigations, and financial crime"
        description="LEAF-C publishes practical commentary for boards, counsel, and operators. These articles are written to be used."
        imageSrc="/consulting_backgroung.jpeg"
        actions={
          <Button href="/get-started" variant="accent" size="md">
            Request a consultation
          </Button>
        }
      />
      <InsightsListing />
    </>
  );
}
