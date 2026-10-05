export type InsightSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidSlug(value: string): boolean {
  return SLUG_PATTERN.test(value) && value.length <= 80;
}

export function parseSections(body: string): InsightSection[] {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const sections: InsightSection[] = [];
  let current: InsightSection = { heading: "Overview", paragraphs: [], bullets: [] };

  const flush = () => {
    const paragraphs = current.paragraphs?.filter(Boolean);
    const bullets = current.bullets?.filter(Boolean);
    if ((paragraphs && paragraphs.length > 0) || (bullets && bullets.length > 0)) {
      sections.push({
        heading: current.heading,
        paragraphs: paragraphs && paragraphs.length > 0 ? paragraphs : undefined,
        bullets: bullets && bullets.length > 0 ? bullets : undefined,
      });
    }
  };

  for (const line of lines) {
    const heading = line.match(/^#{1,3}\s+(.+)/);
    if (heading) {
      flush();
      current = { heading: heading[1].trim(), paragraphs: [], bullets: [] };
      continue;
    }

    const bullet = line.match(/^[-*]\s+(.+)/);
    if (bullet) {
      current.bullets = [...(current.bullets ?? []), bullet[1].trim()];
      continue;
    }

    if (line.trim()) {
      current.paragraphs = [...(current.paragraphs ?? []), line.trim()];
    }
  }

  flush();

  if (sections.length > 0) return sections;
  const trimmed = body.trim();
  return trimmed ? [{ heading: "Overview", paragraphs: [trimmed] }] : [];
}

export function parseTakeaways(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  return [];
}

export function estimateReadMinutes(body: string, takeaways: string[]): number {
  const words = `${body} ${takeaways.join(" ")}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
