import { Router } from "express";
import { asc, eq, sql } from "drizzle-orm";
import { trainingPrograms, trainingSessions, users } from "../db/schema.js";
import { db } from "../db/index.js";
import { requireAdmin, requireAuth, requireStaff } from "../middleware/auth.js";

export const trainingRouter = Router();

const SESSION_STATUSES = ["scheduled", "cancelled", "completed"] as const;
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 4000;
const LOCATION_MAX = 200;

type SessionStatus = (typeof SESSION_STATUSES)[number];

interface CreateSessionBody {
  title?: string;
  description?: string;
  scheduledAt?: string;
  location?: string;
  durationDays?: unknown;
  maxSeats?: unknown;
  programId?: unknown;
}

interface UpdateSessionBody {
  title?: string;
  description?: string | null;
  scheduledAt?: string;
  location?: string | null;
  durationDays?: unknown;
  maxSeats?: unknown;
  status?: string;
}

const sessionListColumns = {
  id: trainingSessions.id,
  programId: trainingSessions.programId,
  programTitle: trainingPrograms.title,
  title: trainingSessions.title,
  description: trainingSessions.description,
  scheduledAt: trainingSessions.scheduledAt,
  location: trainingSessions.location,
  durationDays: trainingSessions.durationDays,
  maxSeats: trainingSessions.maxSeats,
  status: trainingSessions.status,
  createdById: trainingSessions.createdById,
  createdByName: users.name,
  createdAt: trainingSessions.createdAt,
  updatedAt: trainingSessions.updatedAt,
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseScheduledAt(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function parseOptionalText(
  value: unknown,
  maxLength: number,
): { ok: true; value: string | null } | { ok: false } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") return { ok: false };
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return { ok: false };
  return { ok: true, value: trimmed.length > 0 ? trimmed : null };
}

function parseOptionalPositiveInt(
  value: unknown,
): { ok: true; value: number | null } | { ok: false } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return { ok: false };
  return { ok: true, value: n };
}

async function serializeSession(id: number) {
  const [row] = await db
    .select(sessionListColumns)
    .from(trainingSessions)
    .leftJoin(
      trainingPrograms,
      eq(trainingPrograms.id, trainingSessions.programId),
    )
    .innerJoin(users, eq(users.id, trainingSessions.createdById))
    .where(eq(trainingSessions.id, id))
    .limit(1);

  return row ?? null;
}

trainingRouter.use(requireAuth, requireStaff);

trainingRouter.get("/sessions", async (_req, res) => {
  try {
    const sessions = await db
      .select(sessionListColumns)
      .from(trainingSessions)
      .leftJoin(
        trainingPrograms,
        eq(trainingPrograms.id, trainingSessions.programId),
      )
      .innerJoin(users, eq(users.id, trainingSessions.createdById))
      .orderBy(
        sql`${trainingSessions.scheduledAt} < now()`,
        asc(trainingSessions.scheduledAt),
      );

    res.json({ sessions });
  } catch (error) {
    console.error("Failed to list training sessions:", error);
    res.status(500).json({ error: "Unable to load training sessions." });
  }
});

trainingRouter.post("/sessions", requireAdmin, async (req, res) => {
  const body = req.body as CreateSessionBody;
  const errors: Record<string, string> = {};

  if (!isNonEmptyString(body.title)) {
    errors.title = "Session title is required.";
  } else if (body.title.trim().length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
  }

  const scheduledAt = parseScheduledAt(body.scheduledAt);
  if (!scheduledAt) {
    errors.scheduledAt = "A valid scheduled date and time is required.";
  }

  const description = parseOptionalText(body.description, DESCRIPTION_MAX);
  if (!description.ok) {
    errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
  }

  const location = parseOptionalText(body.location, LOCATION_MAX);
  if (!location.ok) {
    errors.location = `Location must be ${LOCATION_MAX} characters or fewer.`;
  }

  const durationDays = parseOptionalPositiveInt(body.durationDays);
  if (!durationDays.ok) {
    errors.durationDays = "Duration must be a whole number of days.";
  }

  const maxSeats = parseOptionalPositiveInt(body.maxSeats);
  if (!maxSeats.ok) {
    errors.maxSeats = "Capacity must be a positive whole number.";
  }

  const programId = parseOptionalPositiveInt(body.programId);
  if (!programId.ok) {
    errors.programId = "Invalid training programme.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  if (
    !description.ok ||
    !location.ok ||
    !durationDays.ok ||
    !maxSeats.ok ||
    !programId.ok ||
    scheduledAt === null
  ) {
    return;
  }

  try {
    if (programId.value !== null) {
      const [program] = await db
        .select({ id: trainingPrograms.id })
        .from(trainingPrograms)
        .where(eq(trainingPrograms.id, programId.value))
        .limit(1);
      if (!program) {
        res.status(400).json({
          error: "Validation failed",
          fields: { programId: "Training programme not found." },
        });
        return;
      }
    }

    const [created] = await db
      .insert(trainingSessions)
      .values({
        title: body.title!.trim(),
        description: description.value,
        scheduledAt,
        location: location.value,
        durationDays: durationDays.value,
        maxSeats: maxSeats.value,
        programId: programId.value,
        createdById: req.auth!.id,
      })
      .returning({ id: trainingSessions.id });

    res.status(201).json({ session: await serializeSession(created.id) });
  } catch (error) {
    console.error("Failed to create training session:", error);
    res.status(500).json({ error: "Unable to create the training session." });
  }
});

trainingRouter.patch("/sessions/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid session id." });
    return;
  }

  const body = req.body as UpdateSessionBody;
  const errors: Record<string, string> = {};
  const updates: {
    title?: string;
    description?: string | null;
    scheduledAt?: Date;
    location?: string | null;
    durationDays?: number | null;
    maxSeats?: number | null;
    status?: SessionStatus;
    updatedAt: Date;
  } = { updatedAt: new Date() };

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      errors.title = "Session title is required.";
    } else if (body.title.trim().length > TITLE_MAX) {
      errors.title = `Title must be ${TITLE_MAX} characters or fewer.`;
    } else {
      updates.title = body.title.trim();
    }
  }

  if (body.scheduledAt !== undefined) {
    const scheduledAt = parseScheduledAt(body.scheduledAt);
    if (!scheduledAt) {
      errors.scheduledAt = "A valid scheduled date and time is required.";
    } else {
      updates.scheduledAt = scheduledAt;
    }
  }

  if (body.description !== undefined) {
    const description = parseOptionalText(body.description, DESCRIPTION_MAX);
    if (!description.ok) {
      errors.description = `Description must be ${DESCRIPTION_MAX} characters or fewer.`;
    } else {
      updates.description = description.value;
    }
  }

  if (body.location !== undefined) {
    const location = parseOptionalText(body.location, LOCATION_MAX);
    if (!location.ok) {
      errors.location = `Location must be ${LOCATION_MAX} characters or fewer.`;
    } else {
      updates.location = location.value;
    }
  }

  if (body.durationDays !== undefined) {
    const durationDays = parseOptionalPositiveInt(body.durationDays);
    if (!durationDays.ok) {
      errors.durationDays = "Duration must be a whole number of days.";
    } else {
      updates.durationDays = durationDays.value;
    }
  }

  if (body.maxSeats !== undefined) {
    const maxSeats = parseOptionalPositiveInt(body.maxSeats);
    if (!maxSeats.ok) {
      errors.maxSeats = "Capacity must be a positive whole number.";
    } else {
      updates.maxSeats = maxSeats.value;
    }
  }

  if (body.status !== undefined) {
    if (
      !isNonEmptyString(body.status) ||
      !SESSION_STATUSES.includes(body.status as SessionStatus)
    ) {
      errors.status = "Select scheduled, cancelled, or completed.";
    } else {
      updates.status = body.status as SessionStatus;
    }
  }

  const hasFieldUpdate = Object.keys(updates).length > 1;
  if (!hasFieldUpdate) {
    res.status(400).json({ error: "No updates provided." });
    return;
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  try {
    const existing = await serializeSession(id);
    if (!existing) {
      res.status(404).json({ error: "Training session not found." });
      return;
    }

    await db
      .update(trainingSessions)
      .set(updates)
      .where(eq(trainingSessions.id, id));

    res.json({ session: await serializeSession(id) });
  } catch (error) {
    console.error("Failed to update training session:", error);
    res.status(500).json({ error: "Unable to update the training session." });
  }
});
