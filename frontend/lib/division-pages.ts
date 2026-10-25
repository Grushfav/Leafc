export const DIVISION_SLUGS = [
  "consultancy",
  "operations",
  "training",
  "polygraph",
] as const;

export type DivisionSlug = (typeof DIVISION_SLUGS)[number];

export type DivisionEntry = {
  title: string;
  body: string;
};

export type DivisionPageContent = {
  heroBadge: string;
  heroTitle: string;
  heroIntro: string;
  highlights: string[];
  introTitle: string;
  paragraphs: string[];
  steps: DivisionEntry[];
  listTitle: string;
  items: DivisionEntry[];
  inquiryTitle: string;
  inquiryDescription: string;
  asideTitle: string;
  asideBody: string;
  linkLabel: string;
  badges: string[];
  certifiedTitle: string;
  certifiedBody: string;
  stats: DivisionEntry[];
  witnessTitle: string;
  witnessParagraphs: string[];
  suitableTitle: string;
  suitable: DivisionEntry[];
  cautionTitle: string;
  cautionIntro: string;
  cautionItems: string[];
  protocolTitle: string;
  protocols: string[];
  credentials: string;
  guideTitle: string;
  guideBody: string;
  guideLabel: string;
  photoCaption: string;
  photoTags: string[];
};

const emptyPolygraph = {
  certifiedTitle: "",
  certifiedBody: "",
  stats: [] as DivisionEntry[],
  witnessTitle: "",
  witnessParagraphs: [] as string[],
  suitableTitle: "",
  suitable: [] as DivisionEntry[],
  cautionTitle: "",
  cautionIntro: "",
  cautionItems: [] as string[],
  protocolTitle: "",
  protocols: [] as string[],
  credentials: "",
  guideTitle: "",
  guideBody: "",
  guideLabel: "",
  photoCaption: "",
  photoTags: [] as string[],
};

export const DIVISION_PAGES: Record<DivisionSlug, DivisionPageContent> = {
  consultancy: {
    heroBadge: "Consultancy Division",
    heroTitle: "Strategic Advisory & Compliance",
    heroIntro:
      "Expert guidance on governance, regulatory compliance, and organisational integrity for public and private sector institutions.",
    highlights: [],
    introTitle: "Our Advisory Process",
    paragraphs: [
      "Our Consultancy Division provides organizations with evidence-based frameworks to strengthen governance, compliance, and risk management. We design anti-fraud systems, conduct comprehensive audits, and deliver policy advisory services that align with international best practices. By combining technical expertise with sector-specific insight, we help clients anticipate vulnerabilities, implement robust safeguards, and maintain operational integrity across complex environments.",
      "Beyond compliance, we position consultancy as a strategic advantage. Our specialists support corporations, financial institutions, and government agencies in building resilient structures that withstand regulatory scrutiny and market pressures. From due diligence assessments to whistleblower system design, every solution is tailored to reinforce transparency, accountability, and long-term trust. The Consultancy Division ensures that clients are not only protected against risk but also empowered to thrive in competitive and regulated landscapes.",
    ],
    steps: [
      { title: "Discovery", body: "Initial scoping and stakeholder interviews" },
      { title: "Assessment", body: "Gap analysis against regulatory frameworks" },
      { title: "Advisory", body: "Recommendations and implementation roadmap" },
      { title: "Review", body: "Ongoing monitoring and compliance validation" },
    ],
    listTitle: "Core Services",
    items: [
      { title: "Compliance framework design & gap analysis", body: "" },
      { title: "Governance audits & board advisory", body: "" },
      { title: "Risk assessment & mitigation planning", body: "" },
      { title: "Policy development & regulatory mapping", body: "" },
      { title: "Due diligence & integrity reviews", body: "" },
    ],
    inquiryTitle: "Request Advisory",
    inquiryDescription: "Submit an initial inquiry for consultancy services.",
    asideTitle: "Why LEAF-C",
    asideBody:
      "Our advisory team works to industry standards and brings professional-services experience in governance, compliance, and risk. All engagements include encrypted document handling and independent oversight.",
    linkLabel: "Request services →",
    badges: [],
    ...emptyPolygraph,
  },
  operations: {
    heroBadge: "Operations Division",
    heroTitle: "Investigations & Field Operations",
    heroIntro:
      "End-to-end investigative services with secure case management, chain-of-custody tracking, and real-time collaboration.",
    highlights: [],
    introTitle: "Operational Capabilities",
    paragraphs: [
      "Our Operations Division delivers specialized investigative and compliance services designed to protect organizations from internal and external threats. We conduct insurance and corporate investigations, deploy intelligence and surveillance capabilities, and apply advanced digital forensics to uncover critical evidence. Each assignment is executed with precision, leveraging technology-driven methodologies to ensure accuracy, reliability, and confidentiality.",
      "Beyond investigations, the division provides verification services such as background checks and integrity assessments, enabling clients to make informed decisions with confidence. Our operational teams are trained to respond swiftly in high-risk environments, maintaining strict chain-of-custody protocols and evidentiary standards. Whether supporting corporations, financial institutions, or government agencies, the Operations Division ensures that every engagement strengthens organizational resilience and safeguards reputational trust.",
    ],
    steps: [
      { title: "Intake", body: "Case registration and priority assignment" },
      { title: "Investigate", body: "Field work, forensics, and intelligence" },
      { title: "Report", body: "Findings compilation and legal review" },
      { title: "Close", body: "Archival with encrypted chain-of-custody" },
    ],
    listTitle: "Operational Capabilities",
    items: [
      { title: "Field investigations & surveillance", body: "" },
      { title: "Digital forensics & evidence recovery", body: "" },
      { title: "Intelligence analysis & reporting", body: "" },
      { title: "Witness interview coordination", body: "" },
      { title: "Cross-jurisdictional liaison", body: "" },
      { title: "Covert operations support", body: "" },
    ],
    inquiryTitle: "Case Intake",
    inquiryDescription: "Register a new investigation request.",
    asideTitle: "Secure Operations",
    asideBody:
      "All cases use encrypted storage, role-based access, and full audit trails. Chain-of-custody maintained for legal admissibility.",
    linkLabel: "Request services →",
    badges: [],
    ...emptyPolygraph,
  },
  training: {
    heroBadge: "Training Division",
    heroTitle: "Professional Development Programmes",
    heroIntro:
      "Accredited training in investigative methodology, forensic science, and international regulatory compliance — building professional capacity.",
    highlights: [
      "LEAF-C accredited certificates",
      "CPE credits for select courses",
      "Industry competency frameworks",
      "Hands-on case simulations",
    ],
    introTitle: "Upcoming Programmes",
    paragraphs: [
      "Our Training Division is dedicated to building professional capacity in investigative methods, integrity testing, and compliance protocols. We deliver structured programs that combine theoretical foundations with practical simulations, ensuring participants gain both knowledge and applied skills. Each course is designed to meet international standards, equipping professionals with the tools to conduct examinations, manage sensitive data, and uphold strict confidentiality requirements.",
      "Beyond technical instruction, we emphasize ethical practice and organizational resilience. Our certified trainers guide participants through real-world case studies, chain-of-custody procedures, and advanced reporting techniques, preparing them to operate effectively in high-stakes environments. Whether serving corporate clients, government agencies, or financial institutions, the Training Division ensures every graduate is ready to apply scientifically validated methods with confidence and integrity.",
    ],
    steps: [{ title: "Programme", body: "Scheduled course with assessment." }],
    listTitle: "Programmes",
    items: [{ title: "Scheduled courses", body: "Listed in the catalogue below." }],
    inquiryTitle: "Enroll in a Programme",
    inquiryDescription: "Register interest for upcoming training sessions.",
    asideTitle: "Certification",
    asideBody:
      "All programmes issue LEAF-C certificates aligned with international competency frameworks. CPE credits available for select courses.",
    linkLabel: "Request training →",
    badges: ["Accredited", "CPE Available"],
    ...emptyPolygraph,
  },
  polygraph: {
    heroBadge: "Specialised Unit",
    heroTitle: "Polygraph & Integrity Testing Unit",
    heroIntro:
      "Certified polygraph examiners delivering scientifically validated integrity assessments under strict confidentiality and chain-of-custody protocols.",
    highlights: [],
    introTitle: "How the unit works",
    paragraphs: [
      "A polygraph examination is a structured interview supported by psychophysiological recording. Certified examiners conduct the work under chain of custody and confidentiality protocols. Every stage, from subject preparation through analysis and reporting, follows documented procedure so the work can stand up to later review.",
      "The instrument does not replace evidence. Used well, it can narrow a specific issue, support pre-employment screening for high-trust roles, and form part of a periodic integrity programme. Examiners are credentialed to UKPA, APA, and CPA standards. Documentation is held securely to protect accuracy and confidentiality.",
    ],
    steps: [
      { title: "Preparation", body: "Rights briefing, consent, and suitability screening before any recording begins." },
      { title: "Examination", body: "A structured interview with computerised psychophysiological recording." },
      { title: "Analysis", body: "Documented review by a credentialed examiner under chain of custody." },
      { title: "Reporting", body: "Confidential findings prepared for the instructing organisation, and for hearings where required." },
    ],
    listTitle: "Examination Types",
    items: [
      { title: "Pre-Employment Screening", body: "Background verification and integrity assessment for new hires in sensitive roles." },
      { title: "Internal Affairs Support", body: "Examinations supporting misconduct investigations and disciplinary proceedings." },
      { title: "Periodic Integrity Assessment", body: "Scheduled re-examinations for personnel in high-trust positions." },
      { title: "Specific Issue Examination", body: "Targeted testing related to a defined allegation or incident." },
    ],
    inquiryTitle: "Request Examination",
    inquiryDescription: "Submit a booking request for polygraph services.",
    asideTitle: "Confidentiality Guarantee",
    asideBody:
      "All examination results are encrypted and accessible only to authorised examiners. Full chain-of-custody maintained.",
    linkLabel: "Request services →",
    badges: [],
    certifiedTitle: "Certified Examiners",
    certifiedBody: "American Polygraph Association standards",
    stats: [
      { title: "1,000+", body: "Examinations" },
      { title: "25+", body: "Combined years" },
      { title: "APA", body: "UKPA and CPA" },
    ],
    witnessTitle: "Expert witness and reporting",
    witnessParagraphs: [
      "Where the instructing organisation may later need the work to stand up in a hearing or in court, examiners can describe their protocol, chain of custody, and limitations in plain language. Documented analysis is prepared for tribunals, hearings, and court of law.",
      "Results inform — they do not automatically determine — employment or disciplinary decisions. They belong in a confidential file with a narrow distribution list.",
    ],
    suitableTitle: "When an examination is useful",
    suitable: [
      {
        title: "High-trust hiring",
        body: "An additional integrity measure for posts with unsupervised access to cash, controlled goods, investigative files, IT administration, or vulnerable people — sitting inside a wider background-check process.",
      },
      {
        title: "A defined incident",
        body: "A specific, testable question after an allegation or loss — not a broad loyalty test, and not a substitute for records, CCTV, or access-log review.",
      },
      {
        title: "Written integrity programmes",
        body: "Periodic examinations for cash, armoury, intelligence, or other high-trust posts, applied consistently under policy rather than used ad hoc.",
      },
    ],
    cautionTitle: "When you should not reach for the polygraph",
    cautionIntro:
      "Do not use an examination to paper over a missing investigation, to pressure a confession, or to decide a workplace dispute that is really about performance. A professional examiner will screen for medical and other suitability issues rather than force a session that cannot be interpreted.",
    cautionItems: [
      "There is no defined issue, timeframe, or group with opportunity.",
      "Core records, CCTV, or access logs have not been preserved or reviewed.",
      "The organisation cannot explain, in writing, the purpose, consent, and use of results.",
    ],
    protocolTitle: "Protocol & Confidentiality",
    protocols: [
      "All sessions conducted in ISO-certified examination rooms",
      "Results encrypted at rest with examiner-only decryption keys",
      "Full audit trail maintained for legal admissibility review",
      "Examinee rights briefing provided prior to every session",
    ],
    credentials:
      "UK Polygraph Association · American Polygraph Association (APA) · Canadian Polygraph Association (CPA)",
    guideTitle: "Practical guidance",
    guideBody:
      "When an organisation should consider a polygraph examination — and when it should not.",
    guideLabel: "Read the brief",
    photoCaption: "Controlled examination environment · APA-aligned protocol",
    photoTags: [
      "Computerised examination instrumentation",
      "Chain of custody verified",
    ],
  },
};

export function isDivisionSlug(value: string): value is DivisionSlug {
  return (DIVISION_SLUGS as readonly string[]).includes(value);
}

export const DIVISION_PAGE_LABELS: Record<DivisionSlug, string> = {
  consultancy: "Consultancy",
  operations: "Operations",
  training: "Training",
  polygraph: "Polygraph",
};

function textOr(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function linesOr(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const lines = value
    .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    .map((entry) => entry.trim());
  return lines.length > 0 ? lines : fallback;
}

function entriesOr(value: unknown, fallback: DivisionEntry[]): DivisionEntry[] {
  if (!Array.isArray(value)) return fallback;
  const entries = value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const title = textOr((entry as DivisionEntry).title, "");
    const body = typeof (entry as DivisionEntry).body === "string" ? (entry as DivisionEntry).body : "";
    return title ? [{ title, body }] : [];
  });
  return entries.length > 0 ? entries : fallback;
}

export function mergeDivisionContent(
  fallback: DivisionPageContent,
  remote: unknown,
): DivisionPageContent {
  if (!remote || typeof remote !== "object") return fallback;
  const data = remote as Partial<DivisionPageContent>;
  return {
    heroBadge: textOr(data.heroBadge, fallback.heroBadge),
    heroTitle: textOr(data.heroTitle, fallback.heroTitle),
    heroIntro: textOr(data.heroIntro, fallback.heroIntro),
    highlights: linesOr(data.highlights, fallback.highlights),
    introTitle: textOr(data.introTitle, fallback.introTitle),
    paragraphs: linesOr(data.paragraphs, fallback.paragraphs),
    steps: entriesOr(data.steps, fallback.steps),
    listTitle: textOr(data.listTitle, fallback.listTitle),
    items: entriesOr(data.items, fallback.items),
    inquiryTitle: textOr(data.inquiryTitle, fallback.inquiryTitle),
    inquiryDescription: textOr(data.inquiryDescription, fallback.inquiryDescription),
    asideTitle: textOr(data.asideTitle, fallback.asideTitle),
    asideBody: textOr(data.asideBody, fallback.asideBody),
    linkLabel: textOr(data.linkLabel, fallback.linkLabel),
    badges: linesOr(data.badges, fallback.badges),
    certifiedTitle: textOr(data.certifiedTitle, fallback.certifiedTitle),
    certifiedBody: textOr(data.certifiedBody, fallback.certifiedBody),
    stats: entriesOr(data.stats, fallback.stats),
    witnessTitle: textOr(data.witnessTitle, fallback.witnessTitle),
    witnessParagraphs: linesOr(data.witnessParagraphs, fallback.witnessParagraphs),
    suitableTitle: textOr(data.suitableTitle, fallback.suitableTitle),
    suitable: entriesOr(data.suitable, fallback.suitable),
    cautionTitle: textOr(data.cautionTitle, fallback.cautionTitle),
    cautionIntro: textOr(data.cautionIntro, fallback.cautionIntro),
    cautionItems: linesOr(data.cautionItems, fallback.cautionItems),
    protocolTitle: textOr(data.protocolTitle, fallback.protocolTitle),
    protocols: linesOr(data.protocols, fallback.protocols),
    credentials: textOr(data.credentials, fallback.credentials),
    guideTitle: textOr(data.guideTitle, fallback.guideTitle),
    guideBody: textOr(data.guideBody, fallback.guideBody),
    guideLabel: textOr(data.guideLabel, fallback.guideLabel),
    photoCaption: textOr(data.photoCaption, fallback.photoCaption),
    photoTags: linesOr(data.photoTags, fallback.photoTags),
  };
}
