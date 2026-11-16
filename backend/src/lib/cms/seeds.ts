import type {
  CmsPageSlug,
  ExpertDraft,
  FooterContent,
  NavContent,
  PageContent,
  SiteNoticeContent,
} from "./types.js";
// PageContent used by upgradeHomeContent

function id(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const DEFAULT_NOTICE: SiteNoticeContent = {
  version: 1,
  enabled: false,
  id: "notice-default",
  title: "Welcome to LEAF-C",
  message:
    "We publish practical guidance and programmes for integrity, investigations, and financial crime. This notice can be updated from Site content.",
  dismissLabel: "Got it",
  linkLabel: "",
  linkHref: "",
};

export const DEFAULT_NAV: NavContent = {
  version: 1,
  primary: [
    { id: "nav-about", label: "About", href: "/about", visible: true },
    { id: "nav-insights", label: "Insights", href: "/insights", visible: true },
    { id: "nav-experts", label: "Experts", href: "/experts", visible: true },
    { id: "nav-programmes", label: "Programmes", href: "/training", visible: true },
  ],
  divisions: [
    { id: "div-consultancy", label: "Consultancy", href: "/consultancy", visible: true },
    { id: "div-operations", label: "Operations", href: "/operations", visible: true },
    { id: "div-training", label: "Training", href: "/training", visible: true },
    {
      id: "div-polygraph",
      label: "Polygraph & Integrity",
      href: "/polygraph",
      visible: true,
    },
  ],
};

export const DEFAULT_FOOTER: FooterContent = {
  version: 1,
  blurb:
    "Law Enforcement Against Financial Crimes — delivering investigative excellence and compliance solutions for public and private sector clients worldwide.",
  location: "Kingston, Jamaica",
  phoneDisplay: "(876) 484-7802",
  phoneHref: "tel:+18764847802",
  email: "support@leafc.net",
  social: [
    { id: "soc-ig", label: "Instagram", href: "https://www.instagram.com/leafc" },
    { id: "soc-tt", label: "TikTok", href: "https://www.tiktok.com/@leafc" },
    { id: "soc-li", label: "LinkedIn", href: "https://www.linkedin.com/company/leaf-c" },
    { id: "soc-fb", label: "Facebook", href: "https://www.facebook.com/leafc" },
  ],
  companyLinks: [
    { id: "co-about", label: "About us", href: "/about", visible: true },
    { id: "co-insights", label: "Insights", href: "/insights", visible: true },
    { id: "co-experts", label: "Our Experts", href: "/experts", visible: true },
    { id: "co-programmes", label: "Programmes", href: "/training", visible: true },
    { id: "co-start", label: "Get Started", href: "/get-started", visible: true },
    { id: "co-login", label: "Staff sign in", href: "/login", visible: true },
  ],
  trustBadges: [
    "ISO-Aligned",
    "Internationally Compliant",
    "Encrypted Data",
    "Independent Oversight",
  ],
};

export const DEFAULT_EXPERTS: ExpertDraft[] = [
  {
    slug: "adrian-wellington",
    name: "Adrian Wellington",
    initials: "AW",
    title: "Founder and Managing Director",
    portrait: "male",
    photoUrl: "/Adrian_Wellington_Headshot.jpeg",
    published: true,
    sortOrder: 0,
    summary:
      "Adrian Wellington is an investigations, ethics and compliance professional with experience spanning law enforcement, anti-corruption investigations, corporate investigations, financial crime and professional education.",
    specialistAreas: [
      "Investigations and financial crime",
      "Ethics and compliance",
      "Anti-corruption inquiries",
      "Corporate investigations",
      "Professional education and training design",
      "Polygraph examination and supervision",
    ],
    experience: [
      "Investigations, ethics and compliance work across public and private sector environments",
      "Development of policy, training and investigative frameworks",
      "Professional education in forensic accounting, fraud and integrity practice",
    ],
    qualifications: [
      "MSc in Forensic Accounting, with Distinction",
      "Trained polygraph examiner and supervisor",
      "ISO 37001 Lead Implementer",
    ],
    memberships: [
      "Certified Fraud Examiner",
      "Accredited Counter Fraud Professional",
    ],
  },
  {
    slug: "shanique-hutchinson",
    name: "Shanique Hutchinson",
    initials: "SH",
    title: "Director, Training",
    portrait: "female",
    published: false,
    sortOrder: 1,
  },
  {
    slug: "jemar-bailey",
    name: "Jemar Bailey",
    initials: "JB",
    title: "Director, Intelligence and Investigations",
    portrait: "male",
    published: false,
    sortOrder: 2,
  },
];

const DEFAULT_DIVISION_SHELL: Record<string, unknown> = {
  heroBadge: "Division",
  heroTitle: "Division title",
  heroIntro: "",
  highlights: [],
  introTitle: "",
  paragraphs: [],
  steps: [],
  listTitle: "",
  items: [],
  inquiryTitle: "Start an inquiry",
  inquiryDescription: "",
  asideTitle: "",
  asideBody: "",
  linkLabel: "Learn more",
  badges: [],
};

function divisionPage(slug: CmsPageSlug, content: Record<string, unknown>): PageContent {
  return {
    version: 1,
    sections: [
      {
        id: id(`${slug}-division`),
        type: "divisionLayout",
        content: { ...DEFAULT_DIVISION_SHELL, ...content },
      },
    ],
  };
}

export function seedPageContent(slug: CmsPageSlug): PageContent {
  switch (slug) {
    case "home":
      return {
        version: 1,
        sections: [
          {
            id: id("home-hero"),
            type: "hero",
            label: "Integrity & Excellence",
            heading:
              "Specialist Investigations, Compliance and Professional Training",
            paragraph:
              "LEAF‑C provides multidisciplinary investigative, compliance, and training services, combining institutional rigor with deep expertise to support governments, enterprises, and justice partners worldwide.",
            mediaType: "video",
            mediaUrl: "/Lady_justice_Video.webm",
            primaryCta: { label: "Get Started", href: "/get-started" },
            secondaryCta: { label: "Explore Divisions", href: "/consultancy" },
          },
          {
            id: id("home-about"),
            type: "richText",
            label: "About",
            heading: "Who we are",
            paragraphs: [
              "LEAF-C brings together experience in investigations, financial crime, compliance, intelligence, polygraph, digital forensics and professional education. The company was established to help organizations strengthen prevention, improve investigative readiness and make defensible decisions based on reliable information.",
              "Our work serves organizations that require specialist capability without maintaining every discipline internally. We define the scope of each engagement, assign appropriate expertise and communicate findings through clear reports, briefings or training outcomes.",
            ],
            sidePanel: {
              stats: [
                {
                  value: "1,000+",
                  label: "Polygraph examinations",
                  body: "Screening, investigation, and integrity assignments.",
                },
                {
                  value: "25+",
                  label: "Combined years of experience",
                },
              ],
              footerTitle: "Certified examiners",
              footerItems: [
                "UK Polygraph Association",
                "American Polygraph Association (APA)",
                "Canadian Polygraph Association (CPA)",
              ],
            },
          },
          {
            id: id("home-services"),
            type: "cardGrid",
            label: "Services",
            heading: "Our Divisions",
            paragraph:
              "Multidisciplinary investigative, advisory, and training solutions for public and private sector clients worldwide.",
            cards: [
              {
                id: id("svc-consult"),
                title: "Consultancy and Advisory",
                href: "/consultancy",
                image: "/services-consulting.png",
                imageAlt: "Professional consultants in a partnership meeting",
                accent: "navy",
                items: [
                  "Anti-fraud and compliance frameworks",
                  "Risk assessments and audits",
                  "Policy advisory and governance support",
                  "Due diligence and whistleblower systems",
                ],
              },
              {
                id: id("svc-ops"),
                title: "Investigations and Operations",
                href: "/operations",
                image: "/services-investigation.jpeg",
                imageAlt: "Investigator reviewing evidence",
                accent: "orange",
                items: [
                  "Internal and insurance investigations",
                  "Intelligence and surveillance",
                  "Digital forensics and data analysis",
                  "Background checks and verification",
                ],
              },
              {
                id: id("svc-train"),
                title: "Training and Capacity Building",
                href: "/training",
                image: "/services-training.png",
                imageAlt: "Professional training session",
                accent: "bronze",
                items: [
                  "Certified professional training programs",
                  "Polygraph examiner training",
                  "Digital forensics courses",
                  "Regional academic partnerships",
                ],
              },
            ],
          },
          {
            id: id("home-polygraph"),
            type: "textImage",
            label: "Specialised Unit",
            heading: "Polygraph & Integrity Testing Unit",
            paragraph:
              "Certified examiners conduct scientifically validated polygraph examinations under chain of custody and confidentiality protocols. Every stage, from subject preparation through analysis and reporting, follows documented procedure so the work can stand up to later review.",
            image: "/polygraph-lie-detector.jpeg",
            imageAlt: "Certified polygraph lie detector examination equipment",
            imagePosition: "right",
          },
          {
            id: id("home-gallery"),
            type: "photoCards",
            label: "In the field",
            heading: "Photo gallery",
            paragraph:
              "Moments from investigations, integrity testing, training, and forensic work.",
            cards: [
              {
                id: id("gal-1"),
                title: "Interview & examination",
                image: "/gallery/interrogation.jpg",
                imageAlt: "Interview room under focused lighting",
              },
              {
                id: id("gal-2"),
                title: "Team collaboration",
                image: "/gallery/team-celebration.jpg",
                imageAlt: "Professionals celebrating a successful collaboration",
              },
              {
                id: id("gal-3"),
                title: "Conference briefing",
                image: "/gallery/conference.jpg",
                imageAlt: "Professionals discussing information in conference",
              },
              {
                id: id("gal-4"),
                title: "Polygraph trace",
                image: "/gallery/polygraph-trace.jpg",
                imageAlt: "Polygraph needles recording on chart paper",
              },
              {
                id: id("gal-5"),
                title: "Surveillance awareness",
                image: "/gallery/surveillance.jpg",
                imageAlt: "Surveillance footage with facial recognition overlay",
              },
              {
                id: id("gal-6"),
                title: "Forensic scene work",
                image: "/gallery/forensics-scene.jpg",
                imageAlt: "Investigators documenting a forensic scene",
              },
            ],
          },
          {
            id: id("home-academy"),
            type: "academy",
            label: "Training & Capacity Building",
            heading: "LEAF-C Academy",
            paragraph:
              "Structured programmes in investigations, integrity, and financial crime, with case work and a LEAF-C certificate.",
            buttonLabel: "View upcoming programmes",
            buttonHref: "/training",
          },
          {
            id: id("home-insights"),
            type: "insights",
            label: "Practical guidance",
            heading: "Insights",
            paragraph:
              "Short briefings on fraud, integrity testing, digital evidence, and financial-crime risk for boards, counsel, and investigators.",
            buttonLabel: "View all insights",
            buttonHref: "/insights",
          },
          {
            id: id("home-industries"),
            type: "cardGrid",
            label: "Who We Serve",
            heading: "Industries We Serve",
            paragraph:
              "LEAF‑C supports individuals, families, and institutions with the same investigative, compliance, and integrity testing rigor, across sectors, and to international standards of accuracy, confidentiality, and accountability.",
            cards: [
              {
                id: id("ind-fin"),
                title: "Financial services and insurance",
                body: "Fraud investigations, claims enquiries, due diligence, compliance reviews, financial crime training and integrity screening",
              },
              {
                id: id("ind-gov"),
                title: "Government and public bodies",
                body: "Procurement integrity, anti-corruption controls, investigations training, policy advisory and institutional capacity building",
              },
              {
                id: id("ind-law"),
                title: "Law enforcement and security",
                body: "Specialist training, intelligence analysis, polygraph support, interviewing and digital evidence awareness",
              },
              {
                id: id("ind-tech"),
                title: "Telecommunications and technology",
                body: "Fraud risk, digital evidence, cybercrime training, due diligence and ethics advisory",
              },
              {
                id: id("ind-trans"),
                title: "Transportation, logistics and construction",
                body: "Accident and incident investigations, loss enquiries, background checks and integrity controls",
              },
              {
                id: id("ind-hosp"),
                title: "Hospitality, tourism and gaming",
                body: "Fraud prevention, integrity screening, background checks, incident enquiries and staff training",
              },
              {
                id: id("ind-legal"),
                title: "Legal and professional services",
                body: "Specialist investigative support, due diligence, forensic review and expert training",
              },
              {
                id: id("ind-edu"),
                title: "Education and training institutions",
                body: "Joint programmes, professional development, ethics education and curriculum support",
              },
              {
                id: id("ind-ngo"),
                title: "NGOs and international organizations",
                body: "Governance reviews, integrity systems, due diligence, investigations support and capacity building",
              },
            ],
          },
          {
            id: id("home-experts"),
            type: "experts",
            label: "Leadership",
            heading: "Our Experts",
            paragraph:
              "The professionals who lead LEAF-C’s investigations, training, and integrity work.",
          },
          {
            id: id("home-newsletter"),
            type: "newsletter",
            label: "Newsletter",
            heading: "Stay informed",
            paragraph:
              "Programme dates, LEAF-C updates, and occasional offers. No account required.",
          },
          {
            id: id("home-inquiry"),
            type: "inquiry",
            label: "Get Started",
            heading: "Ready to use our services?",
            paragraph:
              "Submit an inquiry to begin your engagement — whether you need consultancy, investigations, training, or integrity screening. Our intake team responds within two business days.",
          },
        ],
      };
    case "about":
      return {
        version: 1,
        sections: [
          {
            id: id("about-hero"),
            type: "hero",
            label: "About LEAF-C",
            heading: "Integrity-led investigations and capacity building",
            paragraph:
              "We help institutions prevent, detect, and respond to financial crime and integrity risks.",
          },
          {
            id: id("about-body"),
            type: "richText",
            heading: "Who we are",
            paragraphs: [
              "LEAF-C brings together investigators, trainers, and advisors experienced in law enforcement, corporate investigations, and professional education.",
            ],
          },
          {
            id: id("about-experts"),
            type: "experts",
            heading: "Leadership team",
          },
        ],
      };
    case "experts":
      return {
        version: 1,
        sections: [
          {
            id: id("experts-hero"),
            type: "hero",
            label: "Experts",
            heading: "Our experts",
            paragraph: "Meet the practitioners behind LEAF-C.",
          },
          {
            id: id("experts-list"),
            type: "experts",
            heading: "Team",
          },
        ],
      };
    case "insights":
      return {
        version: 1,
        sections: [
          {
            id: id("insights-hero"),
            type: "hero",
            label: "Insights",
            heading: "Guidance for integrity, investigations, and financial crime",
            paragraph:
              "LEAF-C publishes practical commentary for boards, counsel, and operators. These articles are written to be used.",
            mediaUrl: "/consulting_backgroung.jpeg",
            mediaType: "image",
            primaryCta: {
              label: "Request a consultation",
              href: "/get-started",
            },
          },
        ],
      };
    case "consultancy":
      return divisionPage("consultancy", {
        heroBadge: "Consultancy Division",
        heroTitle: "Strategic Advisory & Compliance",
        heroIntro:
          "Expert guidance on governance, regulatory compliance, and organisational integrity for public and private sector institutions.",
        introTitle: "Our Advisory Process",
        inquiryTitle: "Request Advisory",
        inquiryDescription: "Submit an initial inquiry for consultancy services.",
      });
    case "operations":
      return divisionPage("operations", {
        heroBadge: "Operations Division",
        heroTitle: "Investigations & Operations",
        heroIntro:
          "Discreet, evidence-led investigative support for complex financial crime and integrity matters.",
        introTitle: "How we work",
        inquiryTitle: "Request an investigation",
        inquiryDescription: "Submit a confidential inquiry for operational support.",
      });
    case "training":
      return divisionPage("training", {
        heroBadge: "Training Division",
        heroTitle: "Training & Capacity Building",
        heroIntro:
          "Professional programmes that strengthen investigative, compliance, and integrity capabilities.",
        introTitle: "Learning approach",
        inquiryTitle: "Enquire about training",
        inquiryDescription: "Ask about courses, cohorts, and custom programmes.",
      });
    case "polygraph":
      return divisionPage("polygraph", {
        heroBadge: "Polygraph & Integrity",
        heroTitle: "Polygraph & Integrity Services",
        heroIntro:
          "Examiner-led polygraph and integrity support grounded in professional standards.",
        introTitle: "Our approach",
        inquiryTitle: "Request polygraph support",
        inquiryDescription: "Submit an inquiry for polygraph or integrity services.",
      });
  }
}

export function isCmsPageSlug(value: string): value is CmsPageSlug {
  return (
    value === "home" ||
    value === "about" ||
    value === "experts" ||
    value === "insights" ||
    value === "consultancy" ||
    value === "operations" ||
    value === "training" ||
    value === "polygraph"
  );
}

function aboutMissingSidePanel(sections: unknown[]): boolean {
  const about = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      (section as { type?: string }).type === "richText" &&
      String((section as { label?: string }).label ?? "")
        .toLowerCase()
        .includes("about"),
  );
  if (!about || typeof about !== "object") return true;
  const panel = (about as { sidePanel?: unknown }).sidePanel;
  if (!panel || typeof panel !== "object") return true;
  const stats = (panel as { stats?: unknown }).stats;
  return !Array.isArray(stats) || stats.length === 0;
}

/** True when a stored home draft is the short v1 seed (missing About/industries/etc.). */
export function isIncompleteHomeContent(content: unknown): boolean {
  if (!content || typeof content !== "object") return true;
  const sections = (content as { sections?: unknown }).sections;
  if (!Array.isArray(sections) || sections.length < 8) return true;
  const types = new Set(
    sections
      .map((section) =>
        section && typeof section === "object"
          ? String((section as { type?: unknown }).type ?? "")
          : "",
      )
      .filter(Boolean),
  );
  return (
    !types.has("newsletter") ||
    !types.has("academy") ||
    !types.has("insights") ||
    !types.has("richText") ||
    !types.has("photoCards") ||
    aboutMissingSidePanel(sections)
  );
}

/**
 * Rebuild home from the full seed while preserving a customized hero / first services grid.
 */
export function upgradeHomeContent(current: unknown): PageContent {
  const full = seedPageContent("home");
  if (!current || typeof current !== "object") return full;
  const sections = (current as { sections?: unknown[] }).sections;
  if (!Array.isArray(sections)) return full;

  const hero = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      (section as { type?: string }).type === "hero",
  );
  const services = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      (section as { type?: string }).type === "cardGrid",
  );

  const next = structuredClone(full);
  if (hero) next.sections[0] = hero as PageContent["sections"][number];
  if (services) {
    const servicesIndex = next.sections.findIndex(
      (section) =>
        section.type === "cardGrid" &&
        (section.heading === "Our Divisions" || section.label === "Services"),
    );
    if (servicesIndex >= 0) {
      next.sections[servicesIndex] = services as PageContent["sections"][number];
    }
  }

  const about = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      (section as { type?: string }).type === "richText",
  );
  const aboutIndex = next.sections.findIndex((section) => section.type === "richText");
  if (about && aboutIndex >= 0) {
    const seeded = next.sections[aboutIndex];
    if (seeded.type === "richText") {
      const currentAbout = about as Extract<PageContent["sections"][number], { type: "richText" }>;
      next.sections[aboutIndex] = {
        ...seeded,
        ...currentAbout,
        sidePanel: currentAbout.sidePanel?.stats?.length
          ? currentAbout.sidePanel
          : seeded.sidePanel,
      };
    }
  }

  const gallery = sections.find(
    (section) =>
      section &&
      typeof section === "object" &&
      (section as { type?: string }).type === "photoCards",
  );
  const galleryIndex = next.sections.findIndex((section) => section.type === "photoCards");
  if (gallery && galleryIndex >= 0) {
    next.sections[galleryIndex] = gallery as PageContent["sections"][number];
  }
  return next;
}
