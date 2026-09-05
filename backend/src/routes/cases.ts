import { Router } from "express";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  caseAssignments,
  caseNotes,
  cases,
  divisions,
  users,
} from "../db/schema.js";
import { db } from "../db/index.js";
import {
  isAdminRole,
  requireAdmin,
  requireAuth,
  requireStaff,
  type AuthUser,
} from "../middleware/auth.js";

export const casesRouter = Router();

const DIVISION_TYPES = [
  "consultancy",
  "operations",
  "training",
  "polygraph",
] as const;
const CASE_PRIORITIES = ["low", "medium", "high", "critical"] as const;
const CASE_STATUSES = [
  "new",
  "urgent",
  "in_progress",
  "paused",
  "completed",
] as const;
const ASSIGNABLE_ROLES = ["senior_agent", "agent"] as const;

type DivisionType = (typeof DIVISION_TYPES)[number];
type CasePriority = (typeof CASE_PRIORITIES)[number];
type CaseStatus = (typeof CASE_STATUSES)[number];

const DIVISION_SEED: {
  type: DivisionType;
  name: string;
  description: string;
}[] = [
  {
    type: "consultancy",
    name: "Consultancy Division",
    description: "Strategic advisory and compliance",
  },
  {
    type: "operations",
    name: "Operations Division",
    description: "Investigations and field operations",
  },
  {
    type: "training",
    name: "Training Division",
    description: "Professional development programmes",
  },
  {
    type: "polygraph",
    name: "Polygraph Unit",
    description: "Integrity testing and examinations",
  },
];

interface CreateCaseBody {
  title?: string;
  description?: string;
  divisionType?: string;
  priority?: string;
  jurisdiction?: string;
  status?: string;
  agentIds?: unknown;
}

interface AssignmentBody {
  agentId?: unknown;
}

interface StatusBody {
  status?: string;
}

interface NoteBody {
  body?: string;
}

const caseListColumns = {
  id: cases.id,
  referenceNumber: cases.referenceNumber,
  title: cases.title,
  description: cases.description,
  status: cases.status,
  priority: cases.priority,
  jurisdiction: cases.jurisdiction,
  divisionId: cases.divisionId,
  divisionType: divisions.type,
  divisionName: divisions.name,
  createdAt: cases.createdAt,
  updatedAt: cases.updatedAt,
} as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isAssignableMemberRole(role: string): boolean {
  return (ASSIGNABLE_ROLES as readonly string[]).includes(role);
}

function createReferenceNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CASE-${stamp}-${suffix}`;
}

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseAgentIds(value: unknown): number[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  const ids = value.map((item) => Number(item));
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) return null;
  return [...new Set(ids)];
}

function isAssignedToCase(
  agents: { id: number }[],
  userId: number,
): boolean {
  return agents.some((agent) => agent.id === userId);
}

function canViewCase(auth: AuthUser, agents: { id: number }[]): boolean {
  if (isAdminRole(auth.role)) return true;
  if (agents.length === 0) return true;
  return isAssignedToCase(agents, auth.id);
}

function canNotateCase(auth: AuthUser, agents: { id: number }[]): boolean {
  if (isAdminRole(auth.role)) return true;
  return isAssignedToCase(agents, auth.id);
}

async function ensureDivision(type: DivisionType) {
  const [existing] = await db
    .select()
    .from(divisions)
    .where(eq(divisions.type, type))
    .limit(1);
  if (existing) return existing;

  const seed = DIVISION_SEED.find((item) => item.type === type)!;
  const [created] = await db.insert(divisions).values(seed).returning();
  return created;
}

async function loadAssignableAgents(ids: number[]) {
  if (ids.length === 0) return [];
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(
      and(
        inArray(users.id, ids),
        inArray(users.role, [...ASSIGNABLE_ROLES]),
        eq(users.isActive, true),
      ),
    );
}

async function assignmentsForCases(caseIds: number[]) {
  if (caseIds.length === 0) return [];
  return db
    .select({
      caseId: caseAssignments.caseId,
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(caseAssignments)
    .innerJoin(users, eq(users.id, caseAssignments.userId))
    .where(inArray(caseAssignments.caseId, caseIds));
}

async function notesForCase(caseId: number) {
  return db
    .select({
      id: caseNotes.id,
      body: caseNotes.body,
      createdAt: caseNotes.createdAt,
      authorId: users.id,
      authorName: users.name,
    })
    .from(caseNotes)
    .innerJoin(users, eq(users.id, caseNotes.authorId))
    .where(eq(caseNotes.caseId, caseId))
    .orderBy(desc(caseNotes.createdAt));
}

async function serializeCase(caseId: number) {
  const [row] = await db
    .select(caseListColumns)
    .from(cases)
    .innerJoin(divisions, eq(divisions.id, cases.divisionId))
    .where(eq(cases.id, caseId))
    .limit(1);

  if (!row) return null;

  const [agents, notes] = await Promise.all([
    assignmentsForCases([caseId]),
    notesForCase(caseId),
  ]);

  return {
    ...row,
    agents: agents.map(({ id, name, email, role }) => ({
      id,
      name,
      email,
      role,
    })),
    notes,
  };
}

function presentCase(
  detail: NonNullable<Awaited<ReturnType<typeof serializeCase>>>,
  auth: AuthUser,
) {
  if (canNotateCase(auth, detail.agents)) return detail;
  return { ...detail, notes: [] };
}

async function replaceAssignments(
  caseId: number,
  agentIds: number[],
  assignedById: number,
) {
  await db.delete(caseAssignments).where(eq(caseAssignments.caseId, caseId));
  if (agentIds.length > 0) {
    await db.insert(caseAssignments).values(
      agentIds.map((userId) => ({
        caseId,
        userId,
        assignedById,
      })),
    );
  }
  await db
    .update(cases)
    .set({
      assignedToId: agentIds[0] ?? null,
      updatedAt: new Date(),
    })
    .where(eq(cases.id, caseId));
}

export async function memberVisibleCaseIds(userId: number): Promise<number[]> {
  const assigned = await db
    .select({ caseId: caseAssignments.caseId })
    .from(caseAssignments)
    .where(eq(caseAssignments.userId, userId));

  const open = await db
    .select({ id: cases.id })
    .from(cases)
    .leftJoin(caseAssignments, eq(caseAssignments.caseId, cases.id))
    .where(isNull(caseAssignments.id));

  return [
    ...new Set([
      ...assigned.map((row) => row.caseId),
      ...open.map((row) => row.id),
    ]),
  ];
}

async function loadCaseListRows(ids?: number[]) {
  if (ids && ids.length === 0) return [];

  const base = db
    .select(caseListColumns)
    .from(cases)
    .innerJoin(divisions, eq(divisions.id, cases.divisionId));

  const filtered = ids ? base.where(inArray(cases.id, ids)) : base;
  return filtered.orderBy(desc(cases.createdAt)).limit(100);
}

function mapCasesWithAgents<T extends { id: number }>(
  rows: T[],
  agents: Awaited<ReturnType<typeof assignmentsForCases>>,
) {
  const byCase = new Map<number, typeof agents>();
  for (const agent of agents) {
    const list = byCase.get(agent.caseId) ?? [];
    list.push(agent);
    byCase.set(agent.caseId, list);
  }

  return rows.map((row) => ({
    ...row,
    agents: (byCase.get(row.id) ?? []).map(({ id, name, email, role }) => ({
      id,
      name,
      email,
      role,
    })),
  }));
}

casesRouter.use(requireAuth, requireStaff);

casesRouter.get("/agents", requireAdmin, async (_req, res) => {
  try {
    const agents = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(
        and(
          inArray(users.role, [...ASSIGNABLE_ROLES]),
          eq(users.isActive, true),
        ),
      )
      .orderBy(users.name);

    res.json({ agents });
  } catch (error) {
    console.error("Failed to list agents:", error);
    res.status(500).json({ error: "Unable to load agents." });
  }
});

casesRouter.get("/", async (req, res) => {
  try {
    const auth = req.auth!;
    const ids = isAdminRole(auth.role)
      ? undefined
      : await memberVisibleCaseIds(auth.id);
    const rows = await loadCaseListRows(ids);
    const agents = await assignmentsForCases(rows.map((row) => row.id));

    res.json({ cases: mapCasesWithAgents(rows, agents) });
  } catch (error) {
    console.error("Failed to list cases:", error);
    res.status(500).json({ error: "Unable to load cases." });
  }
});

casesRouter.post("/", requireAdmin, async (req, res) => {
  const body = req.body as CreateCaseBody;
  const errors: Record<string, string> = {};

  if (!isNonEmptyString(body.title)) {
    errors.title = "Case title is required.";
  }

  if (
    !isNonEmptyString(body.divisionType) ||
    !DIVISION_TYPES.includes(body.divisionType as DivisionType)
  ) {
    errors.divisionType = "Select a division.";
  }

  if (
    body.priority !== undefined &&
    body.priority !== "" &&
    !CASE_PRIORITIES.includes(body.priority as CasePriority)
  ) {
    errors.priority = "Invalid priority.";
  }

  if (
    body.status !== undefined &&
    body.status !== "" &&
    !CASE_STATUSES.includes(body.status as CaseStatus)
  ) {
    errors.status = "Invalid status.";
  }

  const agentIds = parseAgentIds(body.agentIds);
  if (agentIds === null) {
    errors.agentIds = "Invalid agent selection.";
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ error: "Validation failed", fields: errors });
    return;
  }

  try {
    const selectedAgents = await loadAssignableAgents(agentIds!);
    if (selectedAgents.length !== agentIds!.length) {
      res.status(400).json({
        error: "Validation failed",
        fields: { agentIds: "One or more agents could not be assigned." },
      });
      return;
    }

    const division = await ensureDivision(body.divisionType as DivisionType);
    const [created] = await db
      .insert(cases)
      .values({
        referenceNumber: createReferenceNumber(),
        title: body.title!.trim(),
        description: isNonEmptyString(body.description)
          ? body.description.trim()
          : null,
        status: (body.status as CaseStatus | undefined) ?? "new",
        priority: (body.priority as CasePriority | undefined) ?? "medium",
        divisionId: division.id,
        jurisdiction: isNonEmptyString(body.jurisdiction)
          ? body.jurisdiction.trim()
          : null,
        assignedToId: agentIds![0] ?? null,
        openedAt: new Date(),
      })
      .returning({ id: cases.id });

    if (agentIds!.length > 0) {
      await db.insert(caseAssignments).values(
        agentIds!.map((userId) => ({
          caseId: created.id,
          userId,
          assignedById: req.auth!.id,
        })),
      );
    }

    const detail = await serializeCase(created.id);
    res.status(201).json({ case: detail });
  } catch (error) {
    console.error("Failed to create case:", error);
    res.status(500).json({ error: "Unable to create the case." });
  }
});

casesRouter.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid case id." });
    return;
  }

  try {
    const detail = await serializeCase(id);
    if (!detail || !canViewCase(req.auth!, detail.agents)) {
      res.status(404).json({ error: "Case not found." });
      return;
    }
    res.json({ case: presentCase(detail, req.auth!) });
  } catch (error) {
    console.error("Failed to load case:", error);
    res.status(500).json({ error: "Unable to load the case." });
  }
});

casesRouter.post("/:id/accept", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid case id." });
    return;
  }

  if (!isAssignableMemberRole(req.auth!.role)) {
    res.status(403).json({
      error: "Only LEAF-C members can accept a case.",
    });
    return;
  }

  try {
    const [member] = await db
      .select({
        id: users.id,
        role: users.role,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.id, req.auth!.id))
      .limit(1);

    if (
      !member ||
      !member.isActive ||
      !isAssignableMemberRole(member.role)
    ) {
      res.status(403).json({
        error: "Only active LEAF-C members can accept a case.",
      });
      return;
    }

    const existing = await serializeCase(id);
    if (!existing) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    if (isAssignedToCase(existing.agents, member.id)) {
      res.status(409).json({
        error: "You are already assigned to this case.",
      });
      return;
    }

    if (existing.agents.length > 0) {
      res.status(409).json({
        error: "This case is not open for members to accept.",
      });
      return;
    }

    await db.insert(caseAssignments).values({
      caseId: id,
      userId: member.id,
      assignedById: member.id,
    });
    await db
      .update(cases)
      .set({
        assignedToId: member.id,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id));

    res.json({ case: await serializeCase(id) });
  } catch (error) {
    console.error("Failed to accept case:", error);
    res.status(500).json({ error: "Unable to accept the case." });
  }
});

casesRouter.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid case id." });
    return;
  }

  const body = req.body as StatusBody;
  if (
    !isNonEmptyString(body.status) ||
    !CASE_STATUSES.includes(body.status as CaseStatus)
  ) {
    res.status(400).json({
      error: "Validation failed",
      fields: { status: "Select a valid ticket status." },
    });
    return;
  }

  const status = body.status as CaseStatus;

  try {
    const existing = await serializeCase(id);
    if (!existing) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    await db
      .update(cases)
      .set({
        status,
        closedAt: status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(cases.id, id));

    res.json({ case: await serializeCase(id) });
  } catch (error) {
    console.error("Failed to update case status:", error);
    res.status(500).json({ error: "Unable to update the case status." });
  }
});

casesRouter.post("/:id/assignments", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid case id." });
    return;
  }

  const body = req.body as AssignmentBody;
  const agentId = Number(body.agentId);
  if (!Number.isInteger(agentId) || agentId <= 0) {
    res.status(400).json({
      error: "Validation failed",
      fields: { agentId: "Select an agent." },
    });
    return;
  }

  try {
    const existing = await serializeCase(id);
    if (!existing) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    const [agent] = await loadAssignableAgents([agentId]);
    if (!agent) {
      res.status(400).json({
        error: "Validation failed",
        fields: { agentId: "That member cannot be assigned to a case." },
      });
      return;
    }

    const nextIds = [...new Set([...existing.agents.map((a) => a.id), agentId])];
    await replaceAssignments(id, nextIds, req.auth!.id);
    res.json({ case: await serializeCase(id) });
  } catch (error) {
    console.error("Failed to assign agent:", error);
    res.status(500).json({ error: "Unable to assign the agent." });
  }
});

casesRouter.delete("/:id/assignments/:userId", requireAdmin, async (req, res) => {
  const id = parseId(req.params.id);
  const userId = parseId(req.params.userId);
  if (!id || !userId) {
    res.status(400).json({ error: "Invalid case or agent id." });
    return;
  }

  try {
    const existing = await serializeCase(id);
    if (!existing) {
      res.status(404).json({ error: "Case not found." });
      return;
    }

    const nextIds = existing.agents
      .map((agent) => agent.id)
      .filter((agentId) => agentId !== userId);
    await replaceAssignments(id, nextIds, req.auth!.id);
    res.json({ case: await serializeCase(id) });
  } catch (error) {
    console.error("Failed to unassign agent:", error);
    res.status(500).json({ error: "Unable to update assignments." });
  }
});

casesRouter.post("/:id/notes", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid case id." });
    return;
  }

  const body = req.body as NoteBody;
  if (!isNonEmptyString(body.body)) {
    res.status(400).json({
      error: "Validation failed",
      fields: { body: "Enter a note." },
    });
    return;
  }
  if (body.body.trim().length > 4000) {
    res.status(400).json({
      error: "Validation failed",
      fields: { body: "Notes must be 4000 characters or fewer." },
    });
    return;
  }

  try {
    const existing = await serializeCase(id);
    if (!existing || !canViewCase(req.auth!, existing.agents)) {
      res.status(404).json({ error: "Case not found." });
      return;
    }
    if (!canNotateCase(req.auth!, existing.agents)) {
      res.status(403).json({
        error: "Accept this case before adding a notation.",
      });
      return;
    }

    await db.insert(caseNotes).values({
      caseId: id,
      authorId: req.auth!.id,
      body: body.body.trim(),
    });
    await db
      .update(cases)
      .set({ updatedAt: new Date() })
      .where(eq(cases.id, id));

    res.status(201).json({ case: await serializeCase(id) });
  } catch (error) {
    console.error("Failed to add note:", error);
    res.status(500).json({ error: "Unable to add the note." });
  }
});
