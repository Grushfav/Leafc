import {
  ALLOWED_INTERNAL_HREFS,
  SECTION_TYPES,
  type ExpertDraft,
  type FooterContent,
  type NavContent,
  type NavItem,
  type PageContent,
  type PoliciesContent,
  type PolicyDocument,
  type Section,
  type SectionType,
  type SiteNoticeContent,
} from "./types.js";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function isAllowedHref(href: string): boolean {
  const pathOnly = href.split("?")[0] ?? href;
  if ((ALLOWED_INTERNAL_HREFS as readonly string[]).includes(pathOnly)) return true;
  if ((ALLOWED_INTERNAL_HREFS as readonly string[]).includes(href)) return true;
  if (href.startsWith("https://") || href.startsWith("http://")) return true;
  if (href.startsWith("tel:") || href.startsWith("mailto:")) return true;
  if (href.startsWith("/insights/")) return true;
  if (pathOnly === "/policies/view") return true;
  return false;
}

function newId(): string {
  return crypto.randomUUID();
}

function normalizeCta(value: unknown): { label: string; href: string } | undefined {
  if (!isObject(value)) return undefined;
  const label = asString(value.label).trim();
  const href = asString(value.href).trim();
  if (!label || !href || !isAllowedHref(href)) return undefined;
  return { label, href };
}

function normalizeSidePanel(value: unknown) {
  if (!isObject(value)) return undefined;
  const statsRaw = Array.isArray(value.stats) ? value.stats : [];
  const stats = statsRaw
    .filter(isObject)
    .map((stat) => ({
      value: asString(stat.value).trim(),
      label: asString(stat.label).trim(),
      body: asOptionalString(stat.body),
    }))
    .filter((stat) => stat.value && stat.label);
  const footerTitle = asOptionalString(value.footerTitle);
  const footerItems = asStringArray(value.footerItems)
    .map((item) => item.trim())
    .filter(Boolean);
  if (!stats.length && !footerTitle && !footerItems.length) return undefined;
  return {
    stats,
    footerTitle,
    footerItems: footerItems.length ? footerItems : undefined,
  };
}

function normalizeSection(raw: unknown): Section | null {
  if (!isObject(raw)) return null;
  const type = asString(raw.type) as SectionType;
  if (!(SECTION_TYPES as readonly string[]).includes(type)) return null;
  const id = asString(raw.id).trim() || newId();

  switch (type) {
    case "hero":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asString(raw.heading).trim() || "Heading",
        paragraph: asOptionalString(raw.paragraph),
        mediaUrl: asOptionalString(raw.mediaUrl),
        mediaType: raw.mediaType === "video" ? "video" : raw.mediaType === "image" ? "image" : undefined,
        primaryCta: normalizeCta(raw.primaryCta),
        secondaryCta: normalizeCta(raw.secondaryCta),
      };
    case "richText":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraphs: asStringArray(raw.paragraphs),
        sidePanel: normalizeSidePanel(raw.sidePanel),
      };
    case "textImage":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
        image: asOptionalString(raw.image),
        imageAlt: asOptionalString(raw.imageAlt),
        imagePosition: raw.imagePosition === "left" ? "left" : "right",
      };
    case "cardGrid": {
      const cardsRaw = Array.isArray(raw.cards) ? raw.cards : [];
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
        cards: cardsRaw.filter(isObject).map((card) => ({
          id: asString(card.id).trim() || newId(),
          title: asString(card.title).trim() || "Card",
          body: asOptionalString(card.body),
          image: asOptionalString(card.image),
          imageAlt: asOptionalString(card.imageAlt),
          href: asOptionalString(card.href),
          accent: asOptionalString(card.accent),
          items: asStringArray(card.items),
        })),
      };
    }
    case "photoCards": {
      const cardsRaw = Array.isArray(raw.cards) ? raw.cards : [];
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
        cards: cardsRaw.filter(isObject).map((card) => ({
          id: asString(card.id).trim() || newId(),
          title: asString(card.title).trim() || "Photo",
          subtitle: asOptionalString(card.subtitle),
          image: asOptionalString(card.image),
          imageAlt: asOptionalString(card.imageAlt),
        })),
      };
    }
    case "experts":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
      };
    case "cta":
      return {
        id,
        type,
        heading: asString(raw.heading).trim() || "Call to action",
        paragraph: asOptionalString(raw.paragraph),
        buttonLabel: asString(raw.buttonLabel).trim() || "Learn more",
        buttonHref: isAllowedHref(asString(raw.buttonHref).trim())
          ? asString(raw.buttonHref).trim()
          : "/get-started",
      };
    case "inquiry":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
      };
    case "academy":
    case "insights":
    case "newsletter":
      return {
        id,
        type,
        label: asOptionalString(raw.label),
        heading: asOptionalString(raw.heading),
        paragraph: asOptionalString(raw.paragraph),
        buttonLabel: asOptionalString(raw.buttonLabel),
        buttonHref: asOptionalString(raw.buttonHref),
      };
    case "divisionLayout":
      return {
        id,
        type,
        content: isObject(raw.content) ? raw.content : {},
      };
    default:
      return null;
  }
}

export function validatePageContent(input: unknown): {
  ok: true;
  value: PageContent;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Page content must be an object." };
  }
  const sectionsRaw = Array.isArray(input.sections) ? input.sections : null;
  if (!sectionsRaw) {
    return { ok: false, error: "Page content requires a sections array." };
  }
  const sections: Section[] = [];
  for (const item of sectionsRaw) {
    const section = normalizeSection(item);
    if (!section) {
      return { ok: false, error: "One or more sections are invalid." };
    }
    sections.push(section);
  }
  return { ok: true, value: { version: 1, sections } };
}

function normalizeNavItem(raw: unknown): NavItem | null {
  if (!isObject(raw)) return null;
  const label = asString(raw.label).trim();
  const href = asString(raw.href).trim();
  if (!label || !href || !isAllowedHref(href)) return null;
  return {
    id: asString(raw.id).trim() || newId(),
    label,
    href,
    visible: raw.visible !== false,
  };
}

export function validateNavContent(input: unknown): {
  ok: true;
  value: NavContent;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Nav content must be an object." };
  }
  const primaryRaw = Array.isArray(input.primary) ? input.primary : [];
  const divisionsRaw = Array.isArray(input.divisions) ? input.divisions : [];
  const primary = primaryRaw.map(normalizeNavItem).filter((item): item is NavItem => item !== null);
  const divisions = divisionsRaw
    .map(normalizeNavItem)
    .filter((item): item is NavItem => item !== null);
  if (primaryRaw.length !== primary.length || divisionsRaw.length !== divisions.length) {
    return { ok: false, error: "Nav items need a label and allowed href." };
  }
  return { ok: true, value: { version: 1, primary, divisions } };
}

export function validateFooterContent(input: unknown): {
  ok: true;
  value: FooterContent;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Footer content must be an object." };
  }
  const socialRaw = Array.isArray(input.social) ? input.social : [];
  const companyRaw = Array.isArray(input.companyLinks) ? input.companyLinks : [];
  const social = socialRaw
    .filter(isObject)
    .map((item) => {
      const label = asString(item.label).trim();
      const href = asString(item.href).trim();
      if (!label || !href || !isAllowedHref(href)) return null;
      return { id: asString(item.id).trim() || newId(), label, href };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const companyLinks = companyRaw
    .map(normalizeNavItem)
    .filter((item): item is NavItem => item !== null);
  if (socialRaw.length !== social.length || companyRaw.length !== companyLinks.length) {
    return { ok: false, error: "Footer links need a label and allowed href." };
  }
  return {
    ok: true,
    value: {
      version: 1,
      blurb: asString(input.blurb),
      location: asString(input.location),
      phoneDisplay: asString(input.phoneDisplay),
      phoneHref: asString(input.phoneHref) || "tel:",
      email: asString(input.email),
      social,
      companyLinks,
      trustBadges: asStringArray(input.trustBadges),
    },
  };
}

export function validatePoliciesContent(input: unknown): {
  ok: true;
  value: PoliciesContent;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Policies content must be an object." };
  }
  const rawList = Array.isArray(input.policies) ? input.policies : [];
  const policies: PolicyDocument[] = [];
  const seen = new Set<string>();

  for (const item of rawList) {
    if (!isObject(item)) {
      return { ok: false, error: "Each policy must be an object." };
    }
    const title = asString(item.title).trim();
    let slug = asString(item.slug).trim().toLowerCase();
    if (!slug && title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (!title || !slug) {
      return { ok: false, error: "Each policy needs a title and slug." };
    }
    if (seen.has(slug)) {
      return { ok: false, error: `Duplicate policy slug: ${slug}` };
    }
    seen.add(slug);
    const sectionsRaw = Array.isArray(item.sections) ? item.sections : [];
    const sections = sectionsRaw.filter(isObject).map((section) => ({
      id: asString(section.id).trim() || newId(),
      title: asString(section.title).trim() || "Section",
      body: asString(section.body),
    }));
    const sortOrder =
      typeof item.sortOrder === "number" && Number.isFinite(item.sortOrder)
        ? Math.trunc(item.sortOrder)
        : policies.length;
    policies.push({
      id: asString(item.id).trim() || newId(),
      slug,
      title,
      badge: asString(item.badge).trim() || "Governance",
      description: asString(item.description),
      updated: asString(item.updated).trim() || new Date().toISOString().slice(0, 10),
      published: Boolean(item.published),
      sortOrder,
      sections,
    });
  }

  return { ok: true, value: { version: 1, policies } };
}

export function validateSiteNoticeContent(input: unknown): {
  ok: true;
  value: SiteNoticeContent;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Notice content must be an object." };
  }
  const title = asString(input.title).trim();
  const message = asString(input.message).trim();
  if (!title) return { ok: false, error: "Notice title is required." };
  if (!message) return { ok: false, error: "Notice message is required." };

  const linkHref = asOptionalString(input.linkHref) ?? "";
  const linkLabel = asOptionalString(input.linkLabel) ?? "";
  if (linkHref && !isAllowedHref(linkHref)) {
    return { ok: false, error: "Notice link must be a valid site path or URL." };
  }
  if (linkHref && !linkLabel) {
    return { ok: false, error: "Add link text when a link URL is set." };
  }

  return {
    ok: true,
    value: {
      version: 1,
      enabled: Boolean(input.enabled),
      id: asString(input.id).trim() || newId(),
      title,
      message,
      dismissLabel: asString(input.dismissLabel).trim() || "Got it",
      linkLabel: linkLabel || undefined,
      linkHref: linkHref || undefined,
    },
  };
}

export function validateExpertDraft(input: unknown): {
  ok: true;
  value: ExpertDraft;
} | {
  ok: false;
  error: string;
} {
  if (!isObject(input)) {
    return { ok: false, error: "Expert must be an object." };
  }
  const name = asString(input.name).trim();
  const title = asString(input.title).trim();
  let slug = asString(input.slug).trim().toLowerCase();
  if (!slug && name) {
    slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  if (!name || !title || !slug) {
    return { ok: false, error: "Expert name, title, and slug are required." };
  }
  const sortOrder =
    typeof input.sortOrder === "number" && Number.isFinite(input.sortOrder)
      ? Math.trunc(input.sortOrder)
      : 0;
  return {
    ok: true,
    value: {
      slug,
      name,
      title,
      photoUrl: asOptionalString(input.photoUrl) ?? null,
      initials: asOptionalString(input.initials),
      portrait: input.portrait === "female" ? "female" : "male",
      email: asOptionalString(input.email) ?? null,
      linkedin: asOptionalString(input.linkedin) ?? null,
      summary: asOptionalString(input.summary) ?? null,
      specialistAreas: asStringArray(input.specialistAreas),
      experience: asStringArray(input.experience),
      qualifications: asStringArray(input.qualifications),
      memberships: asStringArray(input.memberships),
      published: input.published === true,
      sortOrder,
    },
  };
}

export function emptySection(type: SectionType): Section {
  const id = newId();
  switch (type) {
    case "hero":
      return { id, type, heading: "New hero", paragraph: "" };
    case "richText":
      return { id, type, heading: "New section", paragraphs: [""] };
    case "textImage":
      return { id, type, heading: "New section", paragraph: "", imagePosition: "right" };
    case "cardGrid":
      return { id, type, heading: "New cards", cards: [] };
    case "photoCards":
      return {
        id,
        type,
        label: "In the field",
        heading: "Photo gallery",
        paragraph: "",
        cards: [],
      };
    case "experts":
      return { id, type, heading: "Our experts", paragraph: "" };
    case "cta":
      return {
        id,
        type,
        heading: "Get started",
        paragraph: "",
        buttonLabel: "Get Started",
        buttonHref: "/get-started",
      };
    case "inquiry":
      return { id, type, heading: "Start an inquiry", paragraph: "" };
    case "academy":
      return {
        id,
        type,
        label: "Training",
        heading: "LEAF-C Academy",
        paragraph: "",
        buttonLabel: "View programmes",
        buttonHref: "/training",
      };
    case "insights":
      return {
        id,
        type,
        label: "Insights",
        heading: "Insights",
        paragraph: "",
        buttonLabel: "View all insights",
        buttonHref: "/insights",
      };
    case "newsletter":
      return {
        id,
        type,
        label: "Newsletter",
        heading: "Stay informed",
        paragraph: "",
      };
    case "divisionLayout":
      return { id, type, content: {} };
  }
}
