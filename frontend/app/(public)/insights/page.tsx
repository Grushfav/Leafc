import type { Metadata } from "next";
import { InsightsListing } from "@/components/insights/InsightsListing";
import { InsightsPageHero } from "@/components/insights/InsightsPageHero";

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
      <InsightsPageHero />
      <InsightsListing />
    </>
  );
}
