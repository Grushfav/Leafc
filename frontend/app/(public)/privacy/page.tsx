import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How LEAF-C collects, uses, and shares personal information on leafc.net and in the client workspace.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      badge="Governance"
      title="Privacy Policy"
      description="This policy explains what personal information LEAF-C collects when you use our websites and services, why we use it, and the choices you have."
      updated="13 September 2026"
    >
      <PolicySection title="Who we are">
        <p>
          LEAF-C — Law Enforcement Against Financial Crimes — provides
          investigative, consultancy, training, and integrity-testing services
          for public and private sector clients. This policy applies to{" "}
          <a href="https://leafc.net">leafc.net</a>,{" "}
          <a href="https://leafc.co">leafc.co</a>, and the authenticated
          workspace.
        </p>
        <p>
          Questions about this policy:{" "}
          <a href="mailto:info@leafc.net">info@leafc.net</a>.
        </p>
      </PolicySection>

      <PolicySection title="Information we collect">
        <p>We collect information you give us and information created when you use the site:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-heading">Service inquiries.</strong> Name,
            email, phone (optional), organisation (optional), client type,
            service of interest, and your message.
          </li>
          <li>
            <strong className="text-heading">Accounts.</strong> Name, email,
            password (stored as a one-way hash), account type, organisation
            name where relevant, and an optional profile photo.
          </li>
          <li>
            <strong className="text-heading">Workspace records.</strong> Case
            details, assignments, notes, and training session records created
            by authorised staff in the course of an engagement.
          </li>
          <li>
            <strong className="text-heading">Session data.</strong> A sign-in
            token stored in your browser so you remain signed in. We do not
            use advertising cookies or third-party trackers on the public
            site.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="How we use information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Review and respond to inquiries, usually within two business days.</li>
          <li>Create and administer accounts, including staff and client workspaces.</li>
          <li>Deliver the services you request and keep an audit trail of case work.</li>
          <li>
            Send transactional email from{" "}
            <a href="mailto:info@leafc.net">info@leafc.net</a>, including
            inquiry receipts and follow-up from our team.
          </li>
          <li>Protect the security and integrity of our systems and engagements.</li>
        </ul>
        <p>
          We do not sell personal information. We do not use inquiry or case
          content for marketing lists.
        </p>
      </PolicySection>

      <PolicySection title="Who we share information with">
        <p>
          Access is limited to LEAF-C personnel who need it for the engagement
          or to operate the platform. We also use processors that host or
          transmit data on our instructions:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Website hosting and content delivery.</li>
          <li>Database hosting for accounts, inquiries, and workspace records.</li>
          <li>Email delivery for inquiry notices and account-related messages.</li>
        </ul>
        <p>
          We may disclose information if required by law, court order, or a
          competent authority, or to protect the rights, safety, or property of
          LEAF-C, our clients, or others.
        </p>
      </PolicySection>

      <PolicySection title="International transfers">
        <p>
          Our websites and supporting systems may process information in more
          than one country. Where data is transferred, we take steps appropriate
          to the sensitivity of the record and the nature of the engagement.
        </p>
      </PolicySection>

      <PolicySection title="Retention">
        <p>
          Inquiry records are kept for as long as needed to handle the request
          and any related engagement, and thereafter as required for legal,
          audit, or professional-obligation purposes. Account and workspace
          records are retained while the account is active and for a reasonable
          period after closure unless a longer period is required.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You may request access to the personal information we hold about you,
          ask us to correct it, or ask us to delete it where we are not required
          to keep it. Contact{" "}
          <a href="mailto:info@leafc.net">info@leafc.net</a> and include enough
          detail for us to locate the record (for example an inquiry reference
          number).
        </p>
        <p>
          You can close a workspace session at any time with Sign out, which
          clears the token stored in your browser.
        </p>
      </PolicySection>

      <PolicySection title="Children">
        <p>
          Our services are intended for adult clients, organisations, and
          authorised professionals. We do not knowingly collect personal
          information from children.
        </p>
      </PolicySection>

      <PolicySection title="Related policies">
        <p>
          How we safeguard information is described in our{" "}
          <Link href="/data-protection" className="font-medium text-brand-navy underline underline-offset-2">
            Data Protection Policy
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Updates">
        <p>
          We may update this policy as our services or legal obligations
          change. The effective date at the top of the page will be revised
          when we do.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
