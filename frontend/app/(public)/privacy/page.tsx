import type { Metadata } from "next";
import { CmsPolicyView } from "@/components/cms/CmsPolicyView";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How LEAF-C collects, uses, and shares personal information on leafc.net and in the client workspace.",
};

export default function PrivacyPolicyPage() {
  return <CmsPolicyView slug="privacy" />;
}
