export const CMS_PAGE_SLUGS = [
  "home",
  "about",
  "experts",
  "insights",
  "consultancy",
  "operations",
  "training",
  "polygraph",
] as const;

export type CmsPageSlug = (typeof CMS_PAGE_SLUGS)[number];

export const CMS_GLOBAL_KEYS = ["nav", "footer", "policies", "notice"] as const;
export type CmsGlobalKey = (typeof CMS_GLOBAL_KEYS)[number];

/** Informational visitor popup (dismissible). */
export type SiteNoticeContent = {
  version: 1;
  /** When false, popup is not shown even if published. */
  enabled: boolean;
  /** Stable id for dismiss memory; bump on publish when content changes. */
  id: string;
  title: string;
  message: string;
  dismissLabel: string;
  linkLabel?: string;
  linkHref?: string;
};

export type PolicySectionBlock = {
  id: string;
  title: string;
  body: string;
};

export type PolicyDocument = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  description: string;
  updated: string;
  published: boolean;
  sortOrder: number;
  sections: PolicySectionBlock[];
};

export type PoliciesContent = {
  version: 1;
  policies: PolicyDocument[];
};

export const SECTION_TYPES = [
  "hero",
  "richText",
  "textImage",
  "cardGrid",
  "photoCards",
  "experts",
  "cta",
  "inquiry",
  "academy",
  "insights",
  "newsletter",
  "divisionLayout",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type CtaLink = {
  label: string;
  href: string;
};

export type CardItem = {
  id: string;
  title: string;
  body?: string;
  image?: string;
  imageAlt?: string;
  href?: string;
  accent?: string;
  items?: string[];
};

export type PhotoCard = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
};

export type HeroSection = {
  id: string;
  type: "hero";
  label?: string;
  heading: string;
  paragraph?: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  primaryCta?: CtaLink;
  secondaryCta?: CtaLink;
};

export type RichTextSideStat = {
  value: string;
  label: string;
  body?: string;
};

export type RichTextSidePanel = {
  stats: RichTextSideStat[];
  footerTitle?: string;
  footerItems?: string[];
};

export type RichTextSection = {
  id: string;
  type: "richText";
  label?: string;
  heading?: string;
  paragraphs: string[];
  /** Optional fixed-layout side card (Home About). Layout is not editable. */
  sidePanel?: RichTextSidePanel;
};

export type TextImageSection = {
  id: string;
  type: "textImage";
  label?: string;
  heading?: string;
  paragraph?: string;
  image?: string;
  imageAlt?: string;
  imagePosition?: "left" | "right";
};

export type CardGridSection = {
  id: string;
  type: "cardGrid";
  label?: string;
  heading?: string;
  paragraph?: string;
  cards: CardItem[];
};

export type PhotoCardsSection = {
  id: string;
  type: "photoCards";
  label?: string;
  heading?: string;
  paragraph?: string;
  cards: PhotoCard[];
};

export type ExpertsSection = {
  id: string;
  type: "experts";
  label?: string;
  heading?: string;
  paragraph?: string;
};

export type CtaSection = {
  id: string;
  type: "cta";
  heading: string;
  paragraph?: string;
  buttonLabel: string;
  buttonHref: string;
};

export type InquirySection = {
  id: string;
  type: "inquiry";
  label?: string;
  heading?: string;
  paragraph?: string;
};

export type EmbedIntroSection = {
  id: string;
  type: "academy" | "insights" | "newsletter";
  label?: string;
  heading?: string;
  paragraph?: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export type DivisionLayoutSection = {
  id: string;
  type: "divisionLayout";
  content: Record<string, unknown>;
};

export type Section =
  | HeroSection
  | RichTextSection
  | TextImageSection
  | CardGridSection
  | PhotoCardsSection
  | ExpertsSection
  | CtaSection
  | InquirySection
  | EmbedIntroSection
  | DivisionLayoutSection;

export type PageContent = {
  version: 1;
  sections: Section[];
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  visible: boolean;
};

export type NavContent = {
  version: 1;
  primary: NavItem[];
  divisions: NavItem[];
};

export type SocialLink = {
  id: string;
  label: string;
  href: string;
};

export type FooterContent = {
  version: 1;
  blurb: string;
  location: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  social: SocialLink[];
  companyLinks: NavItem[];
  trustBadges: string[];
};

export type ExpertDraft = {
  slug: string;
  name: string;
  title: string;
  photoUrl?: string | null;
  initials?: string;
  portrait?: "male" | "female";
  email?: string | null;
  linkedin?: string | null;
  summary?: string | null;
  specialistAreas?: string[];
  experience?: string[];
  qualifications?: string[];
  memberships?: string[];
  published: boolean;
  sortOrder: number;
};

export type PublishedExpert = ExpertDraft & {
  id: number;
};

export const ALLOWED_INTERNAL_HREFS = [
  "/",
  "/about",
  "/insights",
  "/experts",
  "/training",
  "/consultancy",
  "/operations",
  "/polygraph",
  "/get-started",
  "/login",
  "/privacy",
  "/data-protection",
  "/terms",
  "/policies/view",
  "/signup",
] as const;
