import type { Metadata } from "next";
import { CmsPolicyView } from "@/components/cms/CmsPolicyView";

export const metadata: Metadata = {
  title: "Data Protection Policy",
  description:
    "How LEAF-C protects personal and engagement data, including access control, retention, and incident handling.",
};

export default function DataProtectionPage() {
  return <CmsPolicyView slug="data-protection" />;
}
