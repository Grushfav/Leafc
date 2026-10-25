import { Router } from "express";
import { eq } from "drizzle-orm";
import { divisionPages } from "../db/schema.js";
import { db } from "../db/index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { isNonEmptyString } from "../lib/content.js";

export const divisionPublicRouter = Router();
export const divisionAdminRouter = Router();

divisionAdminRouter.use(requireAuth, requireAdmin);

export const DIVISION_SLUGS = [
  "consultancy",
  "operations",
  "training",
  "polygraph",
] as const;

type DivisionSlug = (typeof DIVISION_SLUGS)[number];

const STRING_FIELDS = [
  "heroBadge",
  "heroTitle",
  "heroIntro",
  "introTitle",
  "listTitle",
  "inquiryTitle",
  "inquiryDescription",
  "asideTitle",
  "asideBody",
  "linkLabel",
  "certifiedTitle",
  "certifiedBody",
  "witnessTitle",
  "suitableTitle",
  "cautionTitle",
  "cautionIntro",
  "protocolTitle",
  "credentials",
  "guideTitle",
  "guideBody",
  "guideLabel",
  "photoCaption",
] as const;

function isSlug(value: string): value is DivisionSlug {
  return (DIVISION_SLUGS as readonly string[]).includes(value);
}

function cleanString(value: unknown, max: number): string | null {
  if (!isNonEmptyString(value)) return null;
  return value.trim().slice(0, max);
}

function cleanItems(value: unknown, maxItems: number, bodyRequired: boolean) {
  if (!Array.isArray(value)) return null;
  const items: { title: string; body: string }[] = [];
  for (const entry of value.slice(0, maxItems)) {
    if (!entry || typeof entry !== "object") return null;
    const title = cleanString((entry as { title?: unknown }).title, 160);
    const body = cleanString((entry as { body?: unknown }).body, 1200) ?? "";
    if (!title) continue;
    if (bodyRequired && !body) return null;
    items.push({ title, body });
  }
  return items;
}

function cleanLines(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return null;
  const lines: string[] = [];
  for (const entry of value.slice(0, maxItems)) {
    const line = cleanString(entry, maxLength);
    if (line) lines.push(line);
  }
  return lines;
}

function validateContent(body: unknown) {
  const errors: Record<string, string> = {};
  if (!body || typeof body !== "object") {
    return { content: "Page content is required." };
  }
  const content = body as Record<string, unknown>;

  for (const field of ["heroBadge", "heroTitle", "heroIntro", "introTitle", "listTitle", "inquiryTitle", "inquiryDescription", "asideTitle", "asideBody", "linkLabel"]) {
    if (!cleanString(content[field], field === "heroIntro" || field.endsWith("Body") || field === "inquiryDescription" ? 1500 : 180)) {
      errors[field] = "This field is required.";
    }
  }

  const paragraphs = cleanLines(content.paragraphs, 4, 2500);
  if (!paragraphs || paragraphs.length < 1) {
    errors.paragraphs = "Add at least one paragraph.";
  }

  const steps = cleanItems(content.steps, 8, true);
  if (!steps) errors.steps = "Each step needs a label and a description.";

  const items = cleanItems(content.items, 12, false);
  if (!items || items.length < 1) errors.items = "Add at least one list item.";

  const highlights = cleanLines(content.highlights, 8, 120);
  if (!highlights) errors.highlights = "Each highlight must be text.";

  const badges = cleanLines(content.badges, 4, 40);
  if (!badges) errors.badges = "Each badge must be text.";

  return errors;
}

function normalizeContent(body: Record<string, unknown>) {
  const content: Record<string, unknown> = {};
  for (const field of STRING_FIELDS) {
    const max =
      field.endsWith("Intro") ||
      field.endsWith("Body") ||
      field === "inquiryDescription" ||
      field === "cautionIntro" ||
      field === "guideBody" ||
      field === "photoCaption"
        ? 1500
        : 180;
    content[field] = cleanString(body[field], max) ?? "";
  }
  content.paragraphs = cleanLines(body.paragraphs, 4, 2500) ?? [];
  content.steps = (cleanItems(body.steps, 8, true) ?? []).map((step) => ({
    title: step.title,
    body: step.body,
  }));
  content.items = cleanItems(body.items, 12, false) ?? [];
  content.highlights = cleanLines(body.highlights, 8, 120) ?? [];
  content.badges = cleanLines(body.badges, 4, 40) ?? [];
  content.stats = (cleanItems(body.stats, 3, true) ?? []).map((stat) => ({
    title: stat.title,
    body: stat.body,
  }));
  content.suitable = cleanItems(body.suitable, 6, true) ?? [];
  content.witnessParagraphs = cleanLines(body.witnessParagraphs, 3, 1500) ?? [];
  content.cautionItems = cleanLines(body.cautionItems, 8, 240) ?? [];
  content.protocols = cleanLines(body.protocols, 8, 240) ?? [];
  content.photoTags = cleanLines(body.photoTags, 4, 80) ?? [];
  return content;
}

divisionPublicRouter.get("/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  if (!isSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }

  try {
    const [row] = await db
      .select({
        slug: divisionPages.slug,
        content: divisionPages.content,
        updatedAt: divisionPages.updatedAt,
      })
      .from(divisionPages)
      .where(eq(divisionPages.slug, slug))
      .limit(1);

    res.json({ page: row ?? null });
  } catch (error) {
    console.error("Failed to load division page:", error);
    res.status(500).json({ error: "Unable to load this page." });
  }
});

divisionAdminRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select({
        slug: divisionPages.slug,
        content: divisionPages.content,
        updatedAt: divisionPages.updatedAt,
      })
      .from(divisionPages);
    res.json({ pages: rows });
  } catch (error) {
    console.error("Failed to list division pages:", error);
    res.status(500).json({ error: "Unable to load division pages." });
  }
});

divisionAdminRouter.put("/:slug", async (req, res) => {
  const slug = String(req.params.slug);
  if (!isSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }

  const errors = validateContent(req.body?.content);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  const content = normalizeContent(req.body.content as Record<string, unknown>);

  try {
    const [saved] = await db
      .insert(divisionPages)
      .values({
        slug,
        content,
        updatedById: req.auth?.id,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: divisionPages.slug,
        set: {
          content,
          updatedById: req.auth?.id,
          updatedAt: new Date(),
        },
      })
      .returning({
        slug: divisionPages.slug,
        content: divisionPages.content,
        updatedAt: divisionPages.updatedAt,
      });

    res.json({ page: saved });
  } catch (error) {
    console.error("Failed to save division page:", error);
    res.status(500).json({ error: "Unable to save this page." });
  }
});
