import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, PolicySection } from "@/components/layout/PolicyPage";

export const metadata: Metadata = {
  title: "Data Protection Policy",
  description:
    "How LEAF-C protects personal and engagement data, including access control, retention, and incident handling.",
};

export default function DataProtectionPage() {
  return (
    <PolicyPage
      badge="Governance"
      title="Data Protection Policy"
      description="This policy describes how LEAF-C protects personal data and confidential engagement material across intake, advisory, operations, training, and integrity-testing work."
      updated="13 September 2026"
    >
      <PolicySection title="Purpose">
        <p>
          LEAF-C handles information that is often confidential, legally
          sensitive, or entrusted to us under professional duty. This policy
          sets the standards our people and systems follow when collecting,
          storing, using, and disposing of that information.
        </p>
        <p>
          It should be read with our{" "}
          <Link href="/privacy" className="font-medium text-brand-navy underline underline-offset-2">
            Privacy Policy
          </Link>
          , which explains what we collect from website visitors and account
          holders.
        </p>
      </PolicySection>

      <PolicySection title="Scope">
        <p>This policy covers:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Public website inquiries and follow-up correspondence.</li>
          <li>Client, organisation, and staff accounts in the workspace.</li>
          <li>Case files, notes, assignments, and training records.</li>
          <li>
            Materials received for consultancy, investigations, polygraph
            examinations, and related reporting.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="Principles">
        <ul className="list-disc space-y-2 pl-5">
          <li>Collect only what is needed for the stated engagement.</li>
          <li>Use information only for that purpose, or a compatible legal duty.</li>
          <li>Limit access to authorised personnel on a need-to-know basis.</li>
          <li>Keep records accurate and update them when we are told they have changed.</li>
          <li>Retain information no longer than the engagement and applicable duties require.</li>
          <li>Protect information in transit and at rest with appropriate controls.</li>
        </ul>
      </PolicySection>

      <PolicySection title="Roles and access">
        <p>
          Administrators manage accounts, assignments, and platform settings.
          Senior agents and agents see the cases and records assigned to them.
          Customers see their own inquiries and account details. Staff invite
          codes are required to create member accounts.
        </p>
        <p>
          Passwords are stored as irreversible hashes. Session tokens are held
          in the signed-in browser and are cleared on sign-out.
        </p>
      </PolicySection>

      <PolicySection title="Safeguards">
        <ul className="list-disc space-y-2 pl-5">
          <li>Encrypted connections to the public site and the workspace.</li>
          <li>Encrypted document handling for engagement materials, as described to clients at intake.</li>
          <li>Role-based access to cases, notes, and training records.</li>
          <li>Audit-oriented case notes and assignment history for accountability.</li>
          <li>
            Hosted infrastructure (site, database, and email) operated under
            our configuration and access policies.
          </li>
        </ul>
        <p>
          No control eliminates all risk. We design for confidentiality
          appropriate to investigative and integrity work, and we review
          access when roles or engagements change.
        </p>
      </PolicySection>

      <PolicySection title="Special-category and examination data">
        <p>
          Polygraph and integrity-testing work may involve sensitive personal
          data. Examinations are conducted under chain-of-custody and
          confidentiality protocols. Results and related notes are available
          only to authorised examiners and designated engagement staff, and
          are retained as required for legal admissibility or client
          instruction.
        </p>
      </PolicySection>

      <PolicySection title="Processors">
        <p>
          We use third-party processors for website hosting, database hosting,
          and email delivery. Those processors act on our instructions and
          must not use LEAF-C data for their own purposes. Inquiry notices
          and receipts are sent from{" "}
          <a href="mailto:info@leafc.net">info@leafc.net</a>.
        </p>
      </PolicySection>

      <PolicySection title="Retention and disposal">
        <p>
          Working files are kept for the life of the engagement and for any
          period required by law, contract, or professional standards. When
          that period ends, we delete or irreversibly anonymise the record,
          or return it to the client if that was agreed.
        </p>
      </PolicySection>

      <PolicySection title="Incidents">
        <p>
          If we become aware of unauthorised access, loss, or disclosure of
          personal or engagement data, we will contain the incident, assess
          the risk, and notify affected clients and, where required, competent
          authorities without undue delay.
        </p>
      </PolicySection>

      <PolicySection title="Requests and complaints">
        <p>
          Data-subject and client requests — including access, correction, and
          deletion — should be sent to{" "}
          <a href="mailto:info@leafc.net">info@leafc.net</a>. We may need to
          verify identity before releasing or changing a record. If you are
          not satisfied with our response, you may raise the matter with the
          supervisory authority that applies to you.
        </p>
      </PolicySection>

      <PolicySection title="Updates">
        <p>
          This policy is reviewed as our systems, processors, or legal duties
          change. The effective date at the top of the page shows the current
          version.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}