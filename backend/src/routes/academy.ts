import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { academyCourses, cmsPages } from "../db/schema.js";
import { db } from "../db/index.js";
import { writeAuditLog } from "../lib/audit.js";
import {
  assertContentPermission,
  requireAuth,
  requirePermission,
  requireStaff,
} from "../middleware/auth.js";
import { isNonEmptyString, parseId } from "../lib/content.js";
import type { PageContent } from "../lib/cms/types.js";
import { validatePageContent } from "../lib/cms/validate.js";
import { ensurePageDraft } from "./cms.js";

export const academyPublicRouter = Router();
export const academyAdminRouter = Router();
export const academyPageAdminRouter = Router();

const TEXT_MAX = 160;
const DESCRIPTION_MAX = 800;

interface CourseBody {
  code?: string;
  title?: string;
  description?: string | null;
  format?: string;
  duration?: string;
  dates?: string;
  level?: string;
  comingSoon?: unknown;
  published?: unknown;
  sortOrder?: unknown;
}

const columns = {
  id: academyCourses.id,
  code: academyCourses.code,
  title: academyCourses.title,
  description: academyCourses.description,
  format: academyCourses.format,
  duration: academyCourses.duration,
  dates: academyCourses.dates,
  level: academyCourses.level,
  comingSoon: academyCourses.comingSoon,
  published: academyCourses.published,
  sortOrder: academyCourses.sortOrder,
  createdAt: academyCourses.createdAt,
  updatedAt: academyCourses.updatedAt,
} as const;

function isComingSoonFlag(value: unknown): boolean {
  return value === true;
}

function validateOptionalText(
  field: "format" | "duration" | "dates",
  value: unknown,
  errors: Record<string, string>,
) {
  if (value === undefined || value === null || value === "") return;
  if (typeof value !== "string") {
    errors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be text.`;
    return;
  }
  if (value.trim().length > TEXT_MAX) {
    errors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be ${TEXT_MAX} characters or fewer.`;
  }
}

function validateCourse(
  body: CourseBody,
  partial: boolean,
  existingComingSoon = false,
) {
  const errors: Record<string, string> = {};
  const comingSoon =
    body.comingSoon === undefined
      ? existingComingSoon
      : isComingSoonFlag(body.comingSoon);
  const requiredFields = comingSoon
    ? (["code", "title", "level"] as const)
    : (["code", "title", "format", "duration", "dates", "level"] as const);
  const optionalWhenComingSoon = ["format", "duration", "dates"] as const;

  for (const field of requiredFields) {
    if (!partial || body[field] !== undefined) {
      const value = body[field];
      if (!isNonEmptyString(value)) {
        errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required.`;
      } else if (value.trim().length > TEXT_MAX) {
        errors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be ${TEXT_MAX} characters or fewer.`;
      }
    }
  }

  if (comingSoon) {
    for (const field of optionalWhenComingSoon) {
      if (!partial || body[field] !== undefined) {
        validateOptionalText(field, body[field], errors);
      }
    }
  }

  if (body.description !== undefined && body.description !== null && body.description !== "") {
    if (typeof body.description !== "string" || body.description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
  }

  return { errors, comingSoon };
}

function optionalCourseText(value: unknown): string {
  return isNonEmptyString(value) ? value.trim() : "";
}

academyPublicRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select(columns)
      .from(academyCourses)
      .where(eq(academyCourses.published, true))
      .orderBy(asc(academyCourses.sortOrder), asc(academyCourses.code));
    res.json({
      courses: rows.map(({ published: _published, ...course }) => course),
    });
  } catch (error) {
    console.error("Failed to list academy courses:", error);
    res.status(500).json({ error: "Unable to load academy courses." });
  }
});

academyAdminRouter.use(requireAuth, requireStaff, requirePermission("canManageAcademy"));

academyAdminRouter.get("/", async (_req, res) => {
  try {
    const rows = await db
      .select(columns)
      .from(academyCourses)
      .orderBy(asc(academyCourses.sortOrder), asc(academyCourses.code));
    res.json({ courses: rows });
  } catch (error) {
    console.error("Failed to list admin academy courses:", error);
    res.status(500).json({ error: "Unable to load academy courses." });
  }
});

academyAdminRouter.post("/", async (req, res) => {
  const body = req.body as CourseBody;
  const { errors, comingSoon } = validateCourse(body, false);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  const sortOrder = Number(body.sortOrder);
  try {
    const [created] = await db
      .insert(academyCourses)
      .values({
        code: body.code!.trim(),
        title: body.title!.trim(),
        description: isNonEmptyString(body.description) ? body.description.trim() : null,
        format: comingSoon ? optionalCourseText(body.format) : body.format!.trim(),
        duration: comingSoon ? optionalCourseText(body.duration) : body.duration!.trim(),
        dates: comingSoon ? optionalCourseText(body.dates) : body.dates!.trim(),
        level: body.level!.trim(),
        comingSoon,
        published: body.published !== false,
        sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
        createdById: req.auth!.id,
      })
      .returning(columns);

    await writeAuditLog({
      userId: req.auth?.id,
      action: "academy.course.create",
      resourceType: "academy_course",
      resourceId: String(created.id),
      req,
      metadata: { code: created.code },
    });

    res.status(201).json({ course: created });
  } catch (error) {
    const duplicate =
      error instanceof Error && /unique|duplicate/i.test(error.message);
    if (duplicate) {
      res.status(409).json({
        error: "Validation failed",
        fields: { code: "A course with this code already exists." },
      });
      return;
    }
    console.error("Failed to create academy course:", error);
    res.status(500).json({ error: "Unable to create the course." });
  }
});

academyAdminRouter.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid course id." });
    return;
  }

  const body = req.body as CourseBody;

  try {
    const [existing] = await db
      .select()
      .from(academyCourses)
      .where(eq(academyCourses.id, id))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "Course not found." });
      return;
    }

    const { errors, comingSoon } = validateCourse(body, true, existing.comingSoon);
    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: "Validation failed", fields: errors });
      return;
    }

    const nextFormat =
      body.format !== undefined ? optionalCourseText(body.format) : existing.format;
    const nextDuration =
      body.duration !== undefined
        ? optionalCourseText(body.duration)
        : existing.duration;
    const nextDates =
      body.dates !== undefined ? optionalCourseText(body.dates) : existing.dates;

    if (!comingSoon) {
      const missingSchedule: Record<string, string> = {};
      if (!nextFormat.trim()) missingSchedule.format = "Format is required.";
      if (!nextDuration.trim()) missingSchedule.duration = "Duration is required.";
      if (!nextDates.trim()) missingSchedule.dates = "Dates is required.";
      if (Object.keys(missingSchedule).length > 0) {
        res.status(400).json({ error: "Validation failed", fields: missingSchedule });
        return;
      }
    }

    const sortOrder = Number(body.sortOrder);
    const [updated] = await db
      .update(academyCourses)
      .set({
        code: isNonEmptyString(body.code) ? body.code.trim() : existing.code,
        title: isNonEmptyString(body.title) ? body.title.trim() : existing.title,
        description:
          body.description !== undefined
            ? isNonEmptyString(body.description)
              ? body.description.trim()
              : null
            : existing.description,
        format: nextFormat,
        duration: nextDuration,
        dates: nextDates,
        level: isNonEmptyString(body.level) ? body.level.trim() : existing.level,
        comingSoon,
        published:
          body.published === undefined ? existing.published : body.published === true,
        sortOrder: Number.isInteger(sortOrder) ? sortOrder : existing.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(academyCourses.id, id))
      .returning(columns);

    await writeAuditLog({
      userId: req.auth?.id,
      action: "academy.course.update",
      resourceType: "academy_course",
      resourceId: String(id),
      req,
      metadata: { code: updated.code },
    });

    res.json({ course: updated });
  } catch (error) {
    console.error("Failed to update academy course:", error);
    res.status(500).json({ error: "Unable to update the course." });
  }
});

academyAdminRouter.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid course id." });
    return;
  }

  try {
    const deleted = await db
      .delete(academyCourses)
      .where(eq(academyCourses.id, id))
      .returning({ id: academyCourses.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: "Course not found." });
      return;
    }
    await writeAuditLog({
      userId: req.auth?.id,
      action: "academy.course.delete",
      resourceType: "academy_course",
      resourceId: String(id),
      req,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete academy course:", error);
    res.status(500).json({ error: "Unable to delete the course." });
  }
});

type AcademyPageCopy = {
  heroBadge: string;
  heroTitle: string;
  heroIntro: string;
  introTitle: string;
  paragraphs: string;
  inquiryTitle: string;
  inquiryDescription: string;
  homeLabel: string;
  homeHeading: string;
  homeParagraph: string;
  homeButtonLabel: string;
  homeButtonHref: string;
};

function asText(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function extractAcademyPageCopy(
  training: PageContent,
  home: PageContent,
): AcademyPageCopy {
  const division = training.sections.find((section) => section.type === "divisionLayout");
  const content =
    division && division.type === "divisionLayout" ? division.content : {};
  const academy = home.sections.find((section) => section.type === "academy");
  const paragraphs = Array.isArray((content as { paragraphs?: unknown }).paragraphs)
    ? ((content as { paragraphs: unknown[] }).paragraphs)
        .filter((item): item is string => typeof item === "string")
        .join("\n\n")
    : "";

  return {
    heroBadge: asText((content as { heroBadge?: unknown }).heroBadge, "Training Division"),
    heroTitle: asText((content as { heroTitle?: unknown }).heroTitle),
    heroIntro: asText((content as { heroIntro?: unknown }).heroIntro),
    introTitle: asText((content as { introTitle?: unknown }).introTitle),
    paragraphs,
    inquiryTitle: asText((content as { inquiryTitle?: unknown }).inquiryTitle),
    inquiryDescription: asText(
      (content as { inquiryDescription?: unknown }).inquiryDescription,
    ),
    homeLabel:
      academy && academy.type === "academy" ? asText(academy.label, "Training") : "Training",
    homeHeading:
      academy && academy.type === "academy"
        ? asText(academy.heading, "LEAF-C Academy")
        : "LEAF-C Academy",
    homeParagraph:
      academy && academy.type === "academy" ? asText(academy.paragraph) : "",
    homeButtonLabel:
      academy && academy.type === "academy"
        ? asText(academy.buttonLabel, "View upcoming programmes")
        : "View upcoming programmes",
    homeButtonHref:
      academy && academy.type === "academy"
        ? asText(academy.buttonHref, "/training")
        : "/training",
  };
}

function applyAcademyPageCopy(
  training: PageContent,
  home: PageContent,
  copy: AcademyPageCopy,
): { training: PageContent; home: PageContent } {
  const paragraphs = copy.paragraphs
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  const nextTraining: PageContent = {
    ...training,
    sections: training.sections.map((section) => {
      if (section.type !== "divisionLayout") return section;
      return {
        ...section,
        content: {
          ...section.content,
          heroBadge: copy.heroBadge.trim() || "Training Division",
          heroTitle: copy.heroTitle.trim(),
          heroIntro: copy.heroIntro.trim(),
          introTitle: copy.introTitle.trim(),
          paragraphs,
          inquiryTitle: copy.inquiryTitle.trim(),
          inquiryDescription: copy.inquiryDescription.trim(),
        },
      };
    }),
  };

  let homeHasAcademy = false;
  const nextHome: PageContent = {
    ...home,
    sections: home.sections.map((section) => {
      if (section.type !== "academy") return section;
      homeHasAcademy = true;
      return {
        ...section,
        label: copy.homeLabel.trim() || "Training",
        heading: copy.homeHeading.trim() || "LEAF-C Academy",
        paragraph: copy.homeParagraph.trim(),
        buttonLabel: copy.homeButtonLabel.trim() || "View upcoming programmes",
        buttonHref: copy.homeButtonHref.trim() || "/training",
      };
    }),
  };
  if (!homeHasAcademy) {
    nextHome.sections.push({
      id: crypto.randomUUID(),
      type: "academy",
      label: copy.homeLabel.trim() || "Training",
      heading: copy.homeHeading.trim() || "LEAF-C Academy",
      paragraph: copy.homeParagraph.trim(),
      buttonLabel: copy.homeButtonLabel.trim() || "View upcoming programmes",
      buttonHref: copy.homeButtonHref.trim() || "/training",
    });
  }

  return { training: nextTraining, home: nextHome };
}

function parseAcademyPageCopy(body: unknown): { ok: true; value: AcademyPageCopy } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid page copy." };
  }
  const raw = body as Record<string, unknown>;
  const value: AcademyPageCopy = {
    heroBadge: asText(raw.heroBadge),
    heroTitle: asText(raw.heroTitle),
    heroIntro: asText(raw.heroIntro),
    introTitle: asText(raw.introTitle),
    paragraphs: asText(raw.paragraphs),
    inquiryTitle: asText(raw.inquiryTitle),
    inquiryDescription: asText(raw.inquiryDescription),
    homeLabel: asText(raw.homeLabel),
    homeHeading: asText(raw.homeHeading),
    homeParagraph: asText(raw.homeParagraph),
    homeButtonLabel: asText(raw.homeButtonLabel),
    homeButtonHref: asText(raw.homeButtonHref),
  };
  if (!value.heroTitle.trim()) {
    return { ok: false, error: "Page title is required." };
  }
  if (!value.homeHeading.trim()) {
    return { ok: false, error: "Homepage Academy heading is required." };
  }
  return { ok: true, value };
}

async function savePageDraft(slug: "training" | "home", content: PageContent, userId: number) {
  const parsed = validatePageContent(content);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  await ensurePageDraft(slug, userId);
  const [updated] = await db
    .update(cmsPages)
    .set({
      draftContent: parsed.value,
      updatedById: userId,
      updatedAt: new Date(),
    })
    .where(eq(cmsPages.slug, slug))
    .returning();
  return updated;
}

async function publishPageDraft(slug: "training" | "home", userId: number) {
  const row = await ensurePageDraft(slug, userId);
  const parsed = validatePageContent(row.draftContent);
  if (!parsed.ok) {
    throw new Error(parsed.error);
  }
  const now = new Date();
  const [updated] = await db
    .update(cmsPages)
    .set({
      publishedContent: parsed.value,
      publishedAt: now,
      updatedById: userId,
      updatedAt: now,
    })
    .where(eq(cmsPages.slug, slug))
    .returning();
  return updated;
}

academyPageAdminRouter.use(
  requireAuth,
  requireStaff,
  requirePermission("canEditPages"),
);

academyPageAdminRouter.get("/page", async (req, res) => {
  try {
    const training = await ensurePageDraft("training", req.auth?.id);
    const home = await ensurePageDraft("home", req.auth?.id);
    const trainingContent = validatePageContent(training.draftContent);
    const homeContent = validatePageContent(home.draftContent);
    if (!trainingContent.ok || !homeContent.ok) {
      res.status(500).json({ error: "Unable to load Academy page copy." });
      return;
    }
    res.json({
      page: extractAcademyPageCopy(trainingContent.value, homeContent.value),
    });
  } catch (error) {
    console.error("Failed to load Academy page copy:", error);
    res.status(500).json({ error: "Unable to load Academy page copy." });
  }
});

academyPageAdminRouter.put("/page", async (req, res) => {
  const parsed = parseAcademyPageCopy(req.body?.page ?? req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  // Academy copy always updates the home page section — require canEditHome (middleware already requires canEditPages).
  if (!(await assertContentPermission(req, res, "canEditHome"))) {
    return;
  }
  const makeLive = Boolean(req.body?.makeLive);
  try {
    const trainingRow = await ensurePageDraft("training", req.auth?.id);
    const homeRow = await ensurePageDraft("home", req.auth?.id);
    const trainingContent = validatePageContent(trainingRow.draftContent);
    const homeContent = validatePageContent(homeRow.draftContent);
    if (!trainingContent.ok || !homeContent.ok) {
      res.status(400).json({ error: "Stored page content is invalid." });
      return;
    }
    const next = applyAcademyPageCopy(
      trainingContent.value,
      homeContent.value,
      parsed.value,
    );
    await savePageDraft("training", next.training, req.auth!.id);
    await savePageDraft("home", next.home, req.auth!.id);
    if (makeLive) {
      await publishPageDraft("training", req.auth!.id);
      await publishPageDraft("home", req.auth!.id);
    }
    res.json({
      page: parsed.value,
      live: makeLive,
    });
  } catch (error) {
    console.error("Failed to save Academy page copy:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unable to save Academy page copy.",
    });
  }
});
