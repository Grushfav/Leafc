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

export const CMS_PAGE_LABELS: Record<CmsPageSlug, string> = {
  home: "Home",
  about: "About",
  experts: "Experts",
  insights: "Insights",
  consultancy: "Consultancy",
  operations: "Operations",
  training: "Training",
  polygraph: "Polygraph",
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

export type CtaLink = { label: string; href: string };

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

export type Section =
  | {
      id: string;
      type: "hero";
      label?: string;
      heading: string;
      paragraph?: string;
      mediaUrl?: string;
      mediaType?: "image" | "video";
      primaryCta?: CtaLink;
      secondaryCta?: CtaLink;
    }
  | {
      id: string;
      type: "richText";
      label?: string;
      heading?: string;
      paragraphs: string[];
      /** Optional fixed-layout side card (Home About). Layout is not editable. */
      sidePanel?: {
        stats: Array<{ value: string; label: string; body?: string }>;
        footerTitle?: string;
        footerItems?: string[];
      };
    }
  | {
      id: string;
      type: "textImage";
      label?: string;
      heading?: string;
      paragraph?: string;
      image?: string;
      imageAlt?: string;
      imagePosition?: "left" | "right";
    }
  | {
      id: string;
      type: "cardGrid";
      label?: string;
      heading?: string;
      paragraph?: string;
      cards: CardItem[];
    }
  | {
      id: string;
      type: "photoCards";
      label?: string;
      heading?: string;
      paragraph?: string;
      cards: PhotoCard[];
    }
  | {
      id: string;
      type: "experts";
      label?: string;
      heading?: string;
      paragraph?: string;
    }
  | {
      id: string;
      type: "cta";
      heading: string;
      paragraph?: string;
      buttonLabel: string;
      buttonHref: string;
    }
  | {
      id: string;
      type: "inquiry";
      label?: string;
      heading?: string;
      paragraph?: string;
    }
  | {
      id: string;
      type: "academy" | "insights" | "newsletter";
      label?: string;
      heading?: string;
      paragraph?: string;
      buttonLabel?: string;
      buttonHref?: string;
    }
  | {
      id: string;
      type: "divisionLayout";
      content: Record<string, unknown>;
    };

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

export type SiteNoticeContent = {
  version: 1;
  enabled: boolean;
  id: string;
  title: string;
  message: string;
  dismissLabel: string;
  linkLabel?: string;
  linkHref?: string;
};

export type PublishedSiteNotice = {
  id: string;
  title: string;
  message: string;
  dismissLabel: string;
  linkLabel: string | null;
  linkHref: string | null;
};

/** Pretty public path for known governance slugs; others use query view. */
export function policyPublicPath(slug: string): string {
  if (slug === "privacy") return "/privacy";
  if (slug === "data-protection") return "/data-protection";
  if (slug === "terms") return "/terms";
  return `/policies/view?slug=${encodeURIComponent(slug)}`;
}

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

export type CmsExpertRecord = {
  id: number;
  draft: ExpertDraft;
  published: ExpertDraft & { id: number };
  publishedAt?: string | null;
  updatedAt?: string;
};

export const PUBLIC_PATH_BY_SLUG: Record<CmsPageSlug, string> = {
  home: "/",
  about: "/about",
  experts: "/experts",
  insights: "/insights",
  consultancy: "/consultancy",
  operations: "/operations",
  training: "/training",
  polygraph: "/polygraph",
};
