import type { PoliciesContent } from "./types.js";

function sid(value: string) {
  return value;
}

/** Default governance policies seeded into cms_globals.policies */
export const DEFAULT_POLICIES: PoliciesContent = {
  version: 1,
  policies: [
    {
      id: sid("policy-privacy"),
      slug: "privacy",
      title: "Privacy Policy",
      badge: "Governance",
      description:
        "This policy explains what personal information LEAF-C collects when you use our websites and services, why we use it, and the choices you have.",
      updated: "13 September 2026",
      published: true,
      sortOrder: 0,
      sections: [
        {
          id: sid("priv-who"),
          title: "Who we are",
          body: `LEAF-C — Law Enforcement Against Financial Crimes — provides investigative, consultancy, training, and integrity-testing services for public and private sector clients. This policy applies to leafc.net, leafc.co, and the authenticated workspace.

Public location: Kingston, Jamaica. Questions about this policy: support@leafc.net.`,
        },
        {
          id: sid("priv-collect"),
          title: "Information we collect",
          body: `We collect information you give us and information created when you use the site:

- Service inquiries. Name, email, phone (optional), organisation (optional), client type, service of interest, and your message.
- Accounts. Name, email, password (stored as a one-way hash), account type, organisation name where relevant, and an optional profile photo.
- Workspace records. Case details, assignments, notes, and training session records created by authorised staff.
- Newsletter. Email address and the time you consented, if you subscribe.
- Session data. A sign-in token stored in your browser so you remain signed in. We do not use advertising cookies or third-party trackers on the public site.`,
        },
        {
          id: sid("priv-use"),
          title: "How we use information",
          body: `- Review and respond to inquiries, usually within two business days.
- Create and administer accounts, including staff and client workspaces.
- Deliver the services you request and keep an audit trail of case work.
- Send transactional email, including inquiry receipts and follow-up from our team.
- Protect the security and integrity of our systems and engagements.
- Send newsletter emails only to addresses that confirmed a subscription.

We do not sell personal information. We do not use inquiry or case content for marketing lists.`,
        },
        {
          id: sid("priv-share"),
          title: "Who we share information with",
          body: `Access is limited to LEAF-C personnel who need it for the engagement or to operate the platform. We also use processors that host or transmit data on our instructions:

- Website hosting and content delivery.
- Database hosting for accounts, inquiries, and workspace records.
- Email delivery for inquiry notices and account-related messages.

We may disclose information if required by law, court order, or a competent authority.`,
        },
        {
          id: sid("priv-updates"),
          title: "Updates",
          body: `We may update this policy as our services or legal obligations change. The effective date at the top of the page will be revised when we do.`,
        },
      ],
    },
    {
      id: sid("policy-data-protection"),
      slug: "data-protection",
      title: "Data Protection Policy",
      badge: "Governance",
      description:
        "This policy describes how LEAF-C protects personal data and confidential engagement material across intake, advisory, operations, training, and integrity-testing work.",
      updated: "13 September 2026",
      published: true,
      sortOrder: 1,
      sections: [
        {
          id: sid("dp-purpose"),
          title: "Purpose",
          body: `LEAF-C handles information that is often confidential, legally sensitive, or entrusted to us under professional duty. This policy sets the standards our people and systems follow when collecting, storing, using, and disposing of that information.

It should be read with our Privacy Policy, which explains what we collect from website visitors and account holders.`,
        },
        {
          id: sid("dp-scope"),
          title: "Scope",
          body: `This policy covers:

- Public website inquiries and follow-up correspondence.
- Client, organisation, and staff accounts in the workspace.
- Case files, notes, assignments, and training records.
- Materials received for consultancy, investigations, polygraph examinations, and related reporting.`,
        },
        {
          id: sid("dp-principles"),
          title: "Principles",
          body: `- Collect only what is needed for the stated engagement.
- Use information only for that purpose, or a compatible legal duty.
- Limit access to authorised personnel on a need-to-know basis.
- Keep records accurate and update them when we are told they have changed.
- Retain information no longer than the engagement and applicable duties require.
- Protect information in transit and at rest with appropriate controls.`,
        },
        {
          id: sid("dp-updates"),
          title: "Updates",
          body: `This policy is reviewed as our systems, processors, or legal duties change. The effective date at the top of the page shows the current version.`,
        },
      ],
    },
    {
      id: sid("policy-terms"),
      slug: "terms",
      title: "Terms and Conditions",
      badge: "Governance",
      description:
        "These terms explain the basis on which you may use leafc.net and related LEAF-C services.",
      updated: "15 November 2026",
      published: true,
      sortOrder: 2,
      sections: [
        {
          id: sid("terms-use"),
          title: "Using this website",
          body: `By using leafc.net you agree to these terms. The site provides general information about LEAF-C services. It does not create a client relationship by itself. Formal engagements begin only when both parties agree in writing.`,
        },
        {
          id: sid("terms-content"),
          title: "Content",
          body: `Site content is provided for information. We take care to keep it accurate, but it may change without notice. You should not rely on website copy alone for legal, investigative, or compliance decisions.`,
        },
        {
          id: sid("terms-contact"),
          title: "Contact",
          body: `Questions about these terms: support@leafc.net. Public location: Kingston, Jamaica.`,
        },
      ],
    },
  ],
};
