import type { CmsPageSlug, Section, SectionType } from "@/lib/cms/types";

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  hero: "Top banner",
  richText: "Text section",
  textImage: "Text and image",
  cardGrid: "Card grid",
  photoCards: "Photo gallery",
  experts: "People list",
  cta: "Call to action",
  inquiry: "Inquiry form",
  academy: "Academy",
  insights: "Insights",
  newsletter: "Newsletter",
  divisionLayout: "Division layout",
};

function headingOf(section: Section): string | undefined {
  if ("heading" in section && section.heading?.trim()) return section.heading.trim();
  return undefined;
}

function labelOf(section: Section): string | undefined {
  if ("label" in section && section.label?.trim()) return section.label.trim();
  return undefined;
}

/** Human name for a block in the page map (never raw CMS type ids). */
export function sectionDisplayName(section: Section, slug?: CmsPageSlug): string {
  const heading = headingOf(section);
  const label = labelOf(section);

  if (section.type === "hero") {
    return slug === "home" ? "Top banner" : heading || "Top banner";
  }

  if (section.type === "cardGrid") {
    if (heading?.toLowerCase().includes("industr")) return "Industries";
    if (
      label?.toLowerCase() === "services" ||
      heading?.toLowerCase().includes("division")
    ) {
      return heading || "Our Divisions";
    }
    return heading || "Cards";
  }

  if (section.type === "richText") {
    if (label?.toLowerCase() === "about" || heading?.toLowerCase().includes("who we")) {
      return heading || "Who we are";
    }
    return heading || "Text section";
  }

  if (section.type === "textImage") {
    if (heading?.toLowerCase().includes("polygraph")) {
      return heading || "Polygraph unit";
    }
    return heading || "Text and image";
  }

  if (section.type === "photoCards") return heading || "Photo gallery";
  if (section.type === "experts") return heading || "Our Experts";
  if (section.type === "academy") return heading || "LEAF-C Academy";
  if (section.type === "insights") return heading || "Insights";
  if (section.type === "newsletter") return heading || "Newsletter";
  if (section.type === "inquiry") return heading || "Inquiry";
  if (section.type === "cta") return heading || "Call to action";
  if (section.type === "divisionLayout") return "Division page layout";

  return SECTION_TYPE_LABELS[section.type] || "Section";
}

export function sectionTypeLabel(type: SectionType): string {
  return SECTION_TYPE_LABELS[type] ?? type;
}
