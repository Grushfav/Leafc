import type { Metadata } from "next";
import { CmsPolicyView } from "@/components/cms/CmsPolicyView";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Terms for using leafc.net and related LEAF-C services.",
};

export default function TermsPage() {
  return <CmsPolicyView slug="terms" />;
}
