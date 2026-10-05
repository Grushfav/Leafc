import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { insights } from "../db/schema.js";
import { db } from "../db/index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  estimateReadMinutes,
  isNonEmptyString,
  isValidSlug,
  parseId,
  parseSections,
  parseTakeaways,
  slugify,
} from "../lib/content.js";

export const insightsPublicRouter = Router();
export const insightsAdminRouter = Router();

const TITLE_MAX = 180;
const DESCRIPTION_MAX = 400;
const BODY_MAX = 20000;
const CATEGORIES = [
  "articles-commentary",
  "financial-crime",
  "fraud-corruption",
  "cybercrime",
  "regulatory",
  "training",
  "case-studies",
  "checklists",
] as const;

type Category = (typeof CATEGORIES)[number];

interface InsightBody {
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  body?: string;
  takeaways?: unknown;
  relatedHref?: string | null;
  relatedLabel?: string | null;
  published?: unknown;
}

const publicColumns = {
  id: insights.id,
  slug: insights.slug,
  title: insights.title,
  description: insights.description,
  category: insights.category,
  body: insights.body,
  sections: insights.sections,
  takeaways: insights.takeaways,
  relatedHref: insights.relatedHref,
  relatedLabel: insights.relatedLabel,
  readMinutes: insights.readMinutes,
  published: insights.published,
  publishedAt: insights.publishedAt,
  createdAt: insights.createdAt,
  updatedAt: insights.updatedAt,
} as const;

function formatPublic(row: {
  slug: string;
  title: string;
  description: string;
  category: string;
  sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
  takeaways: string[];
  relatedHref: string | null;
  relatedLabel: string | null;
  readMinutes: number;
  publishedAt: Date | null;
  createdAt: Date;
}) {
  const isoDate = (row.publishedAt ?? row.createdAt).toISOString().slice(0, 10);
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    date: new Date(isoDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    isoDate,
    readMinutes: row.readMinutes,
    relatedHref: row.relatedHref ?? "/get-started",
    relatedLabel: row.relatedLabel ?? "Get Started",
    sections: row.sections,
    takeaways: row.takeaways,
  };
}

function validateInsight(body: InsightBody, partial: boolean) {
  const errors: Record<string, string> = {};
  const title = body.title;
  const description = body.description;
  const category = body.category;
  const rawBody = body.body;

  if (!partial || title !== undefined) {
    if (!isNonEmptyString(title)) errors.title = "Title is required.";
    else if (title.trim().length > TITLE_MAX) {
      errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
    }
  }

  if (!partial || description !== undefined) {
    if (!isNonEmptyString(description)) {
      errors.description = "Description is required.";
    } else if (description.trim().length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
  }

  if (!partial || category !== undefined) {
    if (!isNonEmptyString(category) || !CATEGORIES.includes(category as Category)) {
      errors.category = "Select a valid category.";
    }
  }

  if (!partial || rawBody !== undefined) {
    if (!isNonEmptyString(rawBody)) errors.body = "Article body is required.";
    else if (rawBody.length > BODY_MAX) {
      errors.body = `Body must be ${BODY_MAX} characters or fewer.`;
    }
  }

  let slug = isNonEmptyString(body.slug) ? slugify(body.slug) : "";
  if (!partial || body.slug !== undefined || title !== undefined) {
    if (!slug && isNonEmptyString(title)) slug = slugify(title);
    if (!isValidSlug(slug)) errors.slug = "Use a short lowercase slug, like my-article-title.";
  }

  const takeaways = parseTakeaways(body.takeaways);
  if (!partial && takeaways.length === 0) {
    errors.takeaways = "Add at least one key takeaway.";
  }

  return { errors, slug, takeaways };
}

insightsPublicRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select(publicColumns)
      .from(insights)
      .where(eq(insights.published, true))
      .orderBy(desc(insights.publishedAt), desc(insights.createdAt));
    res.json({ insights: rows.map(formatPublic) });
  } catch (error) {
    console.error("Failed to list insights:", error);
    res.status(500).json({ error: "Unable to load insights." });
  }
});

insightsPublicRouter.get("/:slug", async (req, res) => {
  const slug = typeof req.params.slug === "string" ? req.params.slug : "";
  if (!isValidSlug(slug)) {
    res.status(400).json({ error: "Invalid article slug." });
    return;
  }

  try {
    const [row] = await db
      .select(publicColumns)
      .from(insights)
      .where(eq(insights.slug, slug))
      .limit(1);
    if (!row || !row.published) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    res.json({ insight: formatPublic(row) });
  } catch (error) {
    console.error("Failed to load insight:", error);
    res.status(500).json({ error: "Unable to load this article." });
  }
});

insightsAdminRouter.use(requireAuth, requireAdmin);

insightsAdminRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select(publicColumns)
      .from(insights)
      .orderBy(desc(insights.updatedAt));
    res.json({ insights: rows });
  } catch (error) {
    console.error("Failed to list admin insights:", error);
    res.status(500).json({ error: "Unable to load insights." });
  }
});

insightsAdminRouter.post("/", async (req, res) => {
  const body = req.body as InsightBody;
  const { errors, slug, takeaways } = validateInsight(body, false);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  const published = body.published === true;
  const articleBody = body.body!.trim();
  const sections = parseSections(articleBody);

  try {
    const [created] = await db
      .insert(insights)
      .values({
        slug,
        title: body.title!.trim(),
        description: body.description!.trim(),
        category: body.category!,
        body: articleBody,
        sections,
        takeaways,
        relatedHref: isNonEmptyString(body.relatedHref) ? body.relatedHref.trim() : "/get-started",
        relatedLabel: isNonEmptyString(body.relatedLabel)
          ? body.relatedLabel.trim()
          : "Get Started",
        readMinutes: estimateReadMinutes(articleBody, takeaways),
        published,
        publishedAt: published ? new Date() : null,
        createdById: req.auth!.id,
      })
      .returning(publicColumns);

    res.status(201).json({ insight: created });
  } catch (error) {
    const duplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    if (duplicate) {
      res.status(409).json({
        error: "Validation failed",
        fields: { slug: "An article with this slug already exists." },
      });
      return;
    }
    console.error("Failed to create insight:", error);
    res.status(500).json({ error: "Unable to create the article." });
  }
});

insightsAdminRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid article id." });
    return;
  }

  const body = req.body as InsightBody;
  const { errors, slug, takeaways } = validateInsight(body, true);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  try {
    const [existing] = await db
      .select()
      .from(insights)
      .where(eq(insights.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Article not found." });
      return;
    }

    const articleBody = isNonEmptyString(body.body) ? body.body.trim() : existing.body;
    const nextTakeaways = body.takeaways !== undefined ? takeaways : existing.takeaways;
    const published =
      body.published === undefined ? existing.published : body.published === true;

    const [updated] = await db
      .update(insights)
      .set({
        slug: body.slug !== undefined || body.title !== undefined ? slug : existing.slug,
        title: isNonEmptyString(body.title) ? body.title.trim() : existing.title,
        description: isNonEmptyString(body.description)
          ? body.description.trim()
          : existing.description,
        category: isNonEmptyString(body.category) ? body.category : existing.category,
        body: articleBody,
        sections: parseSections(articleBody),
        takeaways: nextTakeaways,
        relatedHref:
          body.relatedHref !== undefined
            ? isNonEmptyString(body.relatedHref)
              ? body.relatedHref.trim()
              : "/get-started"
            : existing.relatedHref,
        relatedLabel:
          body.relatedLabel !== undefined
            ? isNonEmptyString(body.relatedLabel)
              ? body.relatedLabel.trim()
              : "Get Started"
            : existing.relatedLabel,
        readMinutes: estimateReadMinutes(articleBody, nextTakeaways),
        published,
        publishedAt: published
          ? existing.publishedAt ?? new Date()
          : null,
        updatedAt: new Date(),
      })
      .where(eq(insights.id, id))
      .returning(publicColumns);

    res.json({ insight: updated });
  } catch (error) {
    console.error("Failed to update insight:", error);
    res.status(500).json({ error: "Unable to update the article." });
  }
});

insightsAdminRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid article id." });
    return;
  }

  try {
    const deleted = await db
      .delete(insights)
      .where(eq(insights.id, id))
      .returning({ id: insights.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: "Article not found." });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete insight:", error);
    res.status(500).json({ error: "Unable to delete the article." });
  }
});
