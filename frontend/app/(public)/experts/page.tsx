import type { Metadata } from "next";
import { CmsOrFallback } from "@/components/cms/CmsOrFallback";
import { ExpertsPageContent } from "@/components/experts/ExpertsPageContent";

export const metadata: Metadata = {
  title: "Our Experts",
  description:
    "LEAF-C’s approved leadership profiles. Meet the Managing Director and directors who lead investigations, training, and integrity work.",
  openGraph: {
    title: "Our Experts | LEAF-C",
    description:
      "Approved public profiles for LEAF-C leadership in investigations, training, and integrity.",
    url: "/experts",
    type: "website",
  },
  alternates: {
    canonical: "/experts",
  },
};

export default function ExpertsPage() {
  return (
    <CmsOrFallback slug="experts">
      <ExpertsPageContent />
    </CmsOrFallback>
  );
}
