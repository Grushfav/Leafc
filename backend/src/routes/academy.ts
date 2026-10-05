import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { academyCourses } from "../db/schema.js";
import { db } from "../db/index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { isNonEmptyString, parseId } from "../lib/content.js";

export const academyPublicRouter = Router();
export const academyAdminRouter = Router();

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
  published: academyCourses.published,
  sortOrder: academyCourses.sortOrder,
  createdAt: academyCourses.createdAt,
  updatedAt: academyCourses.updatedAt,
} as const;

function validateCourse(body: CourseBody, partial: boolean) {
  const errors: Record<string, string> = {};
  const fields = ["code", "title", "format", "duration", "dates", "level"] as const;

  for (const field of fields) {
    if (!partial || body[field] !== undefined) {
      const value = body[field];
      if (!isNonEmptyString(value)) {
        errors[field] = `${field[0].toUpperCase()}${field.slice(1)} is required.`;
      } else if (value.trim().length > TEXT_MAX) {
        errors[field] = `${field[0].toUpperCase()}${field.slice(1)} must be ${TEXT_MAX} characters or fewer.`;
      }
    }
  }

  if (body.description !== undefined && body.description !== null && body.description !== "") {
    if (typeof body.description !== "string" || body.description.length > DESCRIPTION_MAX) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    }
  }

  return errors;
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

academyAdminRouter.use(requireAuth, requireAdmin);

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
  const errors = validateCourse(body, false);
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
        format: body.format!.trim(),
        duration: body.duration!.trim(),
        dates: body.dates!.trim(),
        level: body.level!.trim(),
        published: body.published !== false,
        sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
        createdById: req.auth!.id,
      })
      .returning(columns);

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
  const errors = validateCourse(body, true);
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

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
        format: isNonEmptyString(body.format) ? body.format.trim() : existing.format,
        duration: isNonEmptyString(body.duration) ? body.duration.trim() : existing.duration,
        dates: isNonEmptyString(body.dates) ? body.dates.trim() : existing.dates,
        level: isNonEmptyString(body.level) ? body.level.trim() : existing.level,
        published:
          body.published === undefined ? existing.published : body.published === true,
        sortOrder: Number.isInteger(sortOrder) ? sortOrder : existing.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(academyCourses.id, id))
      .returning(columns);

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
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete academy course:", error);
    res.status(500).json({ error: "Unable to delete the course." });
  }
});
