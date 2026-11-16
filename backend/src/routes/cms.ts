import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { cmsExperts, cmsGlobals, cmsPages, divisionPages } from "../db/schema.js";
import {
  discardUploadedFile,
  isAllowedImageFile,
} from "../lib/avatars.js";
import { parseCmsMediaUpload, persistCmsMediaUpload } from "../lib/cms/media.js";
import { DEFAULT_POLICIES } from "../lib/cms/policy-seeds.js";
import {
  DEFAULT_EXPERTS,
  DEFAULT_FOOTER,
  DEFAULT_NAV,
  DEFAULT_NOTICE,
  isCmsPageSlug,
  isIncompleteHomeContent,
  seedPageContent,
  upgradeHomeContent,
} from "../lib/cms/seeds.js";
import type {
  ExpertDraft,
  PageContent,
  PoliciesContent,
  SiteNoticeContent,
} from "../lib/cms/types.js";
import {
  validateExpertDraft,
  validateFooterContent,
  validateNavContent,
  validatePageContent,
  validatePoliciesContent,
  validateSiteNoticeContent,
} from "../lib/cms/validate.js";
import { writeAuditLog } from "../lib/audit.js";
import {
  assertContentPermission,
  permissionForCmsGlobalKey,
  permissionForCmsPageSlug,
  requireAuth,
  requireSiteContentEditor,
  requireStaff,
} from "../middleware/auth.js";

export const cmsPublicRouter = Router();
export const cmsAdminRouter = Router();

cmsAdminRouter.use(requireAuth, requireStaff, requireSiteContentEditor);

function expertDraftFromRow(row: typeof cmsExperts.$inferSelect): ExpertDraft {
  const rawDraft =
    typeof row.draft === "object" && row.draft !== null && !Array.isArray(row.draft)
      ? (row.draft as Record<string, unknown>)
      : null;
  const parsed = validateExpertDraft(row.draft);
  if (parsed.ok) {
    const draft = parsed.value;
    // Older drafts may omit list fields; keep seeded/published column values until edited.
    return {
      ...draft,
      specialistAreas:
        rawDraft && "specialistAreas" in rawDraft
          ? draft.specialistAreas
          : (row.specialistAreas ?? draft.specialistAreas ?? []),
      experience:
        rawDraft && "experience" in rawDraft
          ? draft.experience
          : (row.experience ?? draft.experience ?? []),
      qualifications:
        rawDraft && "qualifications" in rawDraft
          ? draft.qualifications
          : (row.qualifications ?? draft.qualifications ?? []),
      memberships:
        rawDraft && "memberships" in rawDraft
          ? draft.memberships
          : (row.memberships ?? draft.memberships ?? []),
    };
  }
  return {
    slug: row.slug,
    name: row.name,
    title: row.title,
    photoUrl: row.photoUrl,
    initials: row.initials ?? undefined,
    portrait: row.portrait === "female" ? "female" : "male",
    email: row.email,
    linkedin: row.linkedin,
    summary: row.summary,
    specialistAreas: row.specialistAreas ?? [],
    experience: row.experience ?? [],
    qualifications: row.qualifications ?? [],
    memberships: row.memberships ?? [],
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

function publishedExpertFromRow(row: typeof cmsExperts.$inferSelect) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    photoUrl: row.photoUrl,
    initials: row.initials,
    portrait: row.portrait === "female" ? "female" : "male",
    email: row.email,
    linkedin: row.linkedin,
    summary: row.summary,
    specialistAreas: row.specialistAreas ?? [],
    experience: row.experience ?? [],
    qualifications: row.qualifications ?? [],
    memberships: row.memberships ?? [],
    published: row.published,
    sortOrder: row.sortOrder,
  };
}

export async function ensurePageDraft(slug: string, userId?: number) {
  const [existing] = await db
    .select()
    .from(cmsPages)
    .where(eq(cmsPages.slug, slug))
    .limit(1);

  if (existing) {
    if (slug === "home" && isIncompleteHomeContent(existing.draftContent)) {
      const upgraded = upgradeHomeContent(existing.draftContent);
      // Upgrade draft only — never push upgrades into publishedContent on a read path.
      const [updated] = await db
        .update(cmsPages)
        .set({
          draftContent: upgraded,
          updatedById: userId,
          updatedAt: new Date(),
        })
        .where(eq(cmsPages.slug, slug))
        .returning();
      return updated;
    }
    return existing;
  }

  let seed = seedPageContent(slug as Parameters<typeof seedPageContent>[0]);
  if (
    slug === "consultancy" ||
    slug === "operations" ||
    slug === "training" ||
    slug === "polygraph"
  ) {
    const [legacy] = await db
      .select()
      .from(divisionPages)
      .where(eq(divisionPages.slug, slug))
      .limit(1);
    if (legacy?.content) {
      seed = {
        version: 1,
        sections: [
          {
            id: crypto.randomUUID(),
            type: "divisionLayout",
            content: legacy.content,
          },
        ],
      };
    }
  }

  const [created] = await db
    .insert(cmsPages)
    .values({
      slug,
      draftContent: seed,
      updatedById: userId,
    })
    .returning();
  return created;
}

async function ensureGlobalDraft(
  key: "nav" | "footer" | "policies" | "notice",
  userId?: number,
) {
  const [existing] = await db
    .select()
    .from(cmsGlobals)
    .where(eq(cmsGlobals.key, key))
    .limit(1);
  if (existing) return existing;
  const draft =
    key === "nav"
      ? DEFAULT_NAV
      : key === "footer"
        ? DEFAULT_FOOTER
        : key === "policies"
          ? DEFAULT_POLICIES
          : DEFAULT_NOTICE;
  const [created] = await db
    .insert(cmsGlobals)
    .values({
      key,
      draftContent: draft,
      updatedById: userId,
    })
    .returning();
  return created;
}

async function ensureExpertsSeeded(userId?: number) {
  const existing = await db.select({ id: cmsExperts.id }).from(cmsExperts).limit(1);
  if (existing.length) return;
  for (const expert of DEFAULT_EXPERTS) {
    await db.insert(cmsExperts).values({
      slug: expert.slug,
      name: expert.name,
      title: expert.title,
      photoUrl: expert.photoUrl ?? null,
      initials: expert.initials ?? null,
      portrait: expert.portrait ?? "male",
      email: expert.email ?? null,
      linkedin: expert.linkedin ?? null,
      summary: expert.summary ?? null,
      specialistAreas: expert.specialistAreas ?? [],
      experience: expert.experience ?? [],
      qualifications: expert.qualifications ?? [],
      memberships: expert.memberships ?? [],
      draft: expert,
      published: expert.published,
      sortOrder: expert.sortOrder,
      updatedById: userId,
    });
  }
}

cmsPublicRouter.get("/pages/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "");
  if (!isCmsPageSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  try {
    const [row] = await db
      .select()
      .from(cmsPages)
      .where(eq(cmsPages.slug, slug))
      .limit(1);
    // Public reads must not write. Incomplete home upgrades happen only via admin ensurePageDraft.
    if (!row?.publishedContent) {
      res.json({ page: null });
      return;
    }
    res.json({
      page: {
        slug: row.slug,
        content: row.publishedContent,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to load published CMS page:", error);
    res.status(500).json({ error: "Unable to load page." });
  }
});

cmsPublicRouter.get("/experts", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(cmsExperts)
      .where(eq(cmsExperts.published, true))
      .orderBy(asc(cmsExperts.sortOrder), asc(cmsExperts.id));
    res.json({ experts: rows.map(publishedExpertFromRow) });
  } catch (error) {
    console.error("Failed to load published experts:", error);
    res.status(500).json({ error: "Unable to load experts." });
  }
});

cmsPublicRouter.get("/nav", async (_req, res) => {
  try {
    const [row] = await db
      .select()
      .from(cmsGlobals)
      .where(eq(cmsGlobals.key, "nav"))
      .limit(1);
    res.json({ nav: row?.publishedContent ?? null });
  } catch (error) {
    console.error("Failed to load nav:", error);
    res.status(500).json({ error: "Unable to load navigation." });
  }
});

cmsPublicRouter.get("/footer", async (_req, res) => {
  try {
    const [row] = await db
      .select()
      .from(cmsGlobals)
      .where(eq(cmsGlobals.key, "footer"))
      .limit(1);
    res.json({ footer: row?.publishedContent ?? null });
  } catch (error) {
    console.error("Failed to load footer:", error);
    res.status(500).json({ error: "Unable to load footer." });
  }
});

cmsPublicRouter.get("/notice", async (_req, res) => {
  try {
    const [row] = await db
      .select()
      .from(cmsGlobals)
      .where(eq(cmsGlobals.key, "notice"))
      .limit(1);
    const content = (row?.publishedContent ?? null) as SiteNoticeContent | null;
    if (!content?.enabled) {
      res.json({ notice: null });
      return;
    }
    res.json({
      notice: {
        id: content.id,
        title: content.title,
        message: content.message,
        dismissLabel: content.dismissLabel || "Got it",
        linkLabel: content.linkLabel || null,
        linkHref: content.linkHref || null,
      },
    });
  } catch (error) {
    console.error("Failed to load site notice:", error);
    res.status(500).json({ error: "Unable to load notice." });
  }
});

cmsPublicRouter.get("/policies", async (_req, res) => {
  try {
    let [row] = await db
      .select()
      .from(cmsGlobals)
      .where(eq(cmsGlobals.key, "policies"))
      .limit(1);
    if (!row) {
      row = await ensureGlobalDraft("policies");
    }
    const content = (row.publishedContent ?? row.draftContent) as PoliciesContent | null;
    const policies = (content?.policies ?? [])
      .filter((policy) => policy.published)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title))
      .map((policy) => ({
        slug: policy.slug,
        title: policy.title,
        description: policy.description,
        updated: policy.updated,
        badge: policy.badge,
      }));
    res.json({ policies });
  } catch (error) {
    console.error("Failed to load policies list:", error);
    res.status(500).json({ error: "Unable to load policies." });
  }
});

cmsPublicRouter.get("/policies/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "").toLowerCase();
  try {
    let [row] = await db
      .select()
      .from(cmsGlobals)
      .where(eq(cmsGlobals.key, "policies"))
      .limit(1);
    if (!row) {
      row = await ensureGlobalDraft("policies");
    }
    const content = (row.publishedContent ?? row.draftContent) as PoliciesContent | null;
    const policy = (content?.policies ?? []).find(
      (item) => item.slug === slug && item.published,
    );
    if (!policy) {
      res.status(404).json({ error: "Policy not found." });
      return;
    }
    res.json({ policy });
  } catch (error) {
    console.error("Failed to load policy:", error);
    res.status(500).json({ error: "Unable to load policy." });
  }
});

cmsAdminRouter.get("/pages", async (_req, res) => {
  try {
    const rows = await db.select().from(cmsPages);
    res.json({
      pages: rows.map((row) => ({
        slug: row.slug,
        hasPublished: Boolean(row.publishedContent),
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to list CMS pages:", error);
    res.status(500).json({ error: "Unable to list pages." });
  }
});

cmsAdminRouter.get("/pages/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "");
  if (!isCmsPageSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsPageSlug(slug)))) {
    return;
  }
  try {
    const row = await ensurePageDraft(slug, req.auth?.id);
    res.json({
      page: {
        slug: row.slug,
        draftContent: row.draftContent,
        publishedContent: row.publishedContent,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to load CMS draft page:", error);
    res.status(500).json({ error: "Unable to load page draft." });
  }
});

cmsAdminRouter.get("/pages/:slug/preview", async (req, res) => {
  const slug = String(req.params.slug ?? "");
  if (!isCmsPageSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsPageSlug(slug)))) {
    return;
  }
  try {
    const row = await ensurePageDraft(slug, req.auth?.id);
    res.json({
      page: {
        slug: row.slug,
        content: row.draftContent as PageContent,
        updatedAt: row.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to preview CMS page:", error);
    res.status(500).json({ error: "Unable to preview page." });
  }
});

cmsAdminRouter.put("/pages/:slug", async (req, res) => {
  const slug = String(req.params.slug ?? "");
  if (!isCmsPageSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsPageSlug(slug)))) {
    return;
  }
  const parsed = validatePageContent(req.body?.content ?? req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    await ensurePageDraft(slug, req.auth?.id);
    const [updated] = await db
      .update(cmsPages)
      .set({
        draftContent: parsed.value,
        updatedById: req.auth!.id,
        updatedAt: new Date(),
      })
      .where(eq(cmsPages.slug, slug))
      .returning();
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.page.save",
      resourceType: "cms_page",
      resourceId: slug,
      req,
    });
    res.json({
      page: {
        slug: updated.slug,
        draftContent: updated.draftContent,
        publishedContent: updated.publishedContent,
        publishedAt: updated.publishedAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to save CMS page draft:", error);
    res.status(500).json({ error: "Unable to save page draft." });
  }
});

cmsAdminRouter.post("/pages/:slug/publish", async (req, res) => {
  const slug = String(req.params.slug ?? "");
  if (!isCmsPageSlug(slug)) {
    res.status(404).json({ error: "Page not found." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsPageSlug(slug)))) {
    return;
  }
  try {
    const row = await ensurePageDraft(slug, req.auth?.id);
    const parsed = validatePageContent(row.draftContent);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const now = new Date();
    const [updated] = await db
      .update(cmsPages)
      .set({
        publishedContent: parsed.value,
        publishedAt: now,
        updatedById: req.auth!.id,
        updatedAt: now,
      })
      .where(eq(cmsPages.slug, slug))
      .returning();
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.page.publish",
      resourceType: "cms_page",
      resourceId: slug,
      req,
    });
    res.json({
      page: {
        slug: updated.slug,
        draftContent: updated.draftContent,
        publishedContent: updated.publishedContent,
        publishedAt: updated.publishedAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to publish CMS page:", error);
    res.status(500).json({ error: "Unable to publish page." });
  }
});

cmsAdminRouter.get("/experts", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  try {
    await ensureExpertsSeeded(req.auth?.id);
    const rows = await db
      .select()
      .from(cmsExperts)
      .orderBy(asc(cmsExperts.sortOrder), asc(cmsExperts.id));
    res.json({
      experts: rows.map((row) => ({
        id: row.id,
        draft: expertDraftFromRow(row),
        published: publishedExpertFromRow(row),
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to list CMS experts:", error);
    res.status(500).json({ error: "Unable to load experts." });
  }
});

cmsAdminRouter.post("/experts", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  const parsed = validateExpertDraft(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    await ensureExpertsSeeded(req.auth?.id);
    const [created] = await db
      .insert(cmsExperts)
      .values({
        slug: parsed.value.slug,
        name: parsed.value.name,
        title: parsed.value.title,
        draft: parsed.value,
        published: false,
        sortOrder: parsed.value.sortOrder,
        updatedById: req.auth!.id,
      })
      .returning();
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.expert.create",
      resourceType: "cms_expert",
      resourceId: String(created.id),
      req,
      metadata: { slug: created.slug },
    });
    res.status(201).json({
      expert: {
        id: created.id,
        draft: expertDraftFromRow(created),
        published: publishedExpertFromRow(created),
      },
    });
  } catch (error) {
    console.error("Failed to create expert:", error);
    res.status(500).json({ error: "Unable to create expert." });
  }
});

cmsAdminRouter.put("/experts/reorder", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  const order = Array.isArray(req.body?.order) ? req.body.order : null;
  if (!order || !order.every((id: unknown) => typeof id === "number")) {
    res.status(400).json({ error: "order must be an array of expert ids." });
    return;
  }
  try {
    const rows = await db.select().from(cmsExperts);
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (let index = 0; index < order.length; index += 1) {
      const row = byId.get(order[index]);
      if (!row) continue;
      const draft = expertDraftFromRow(row);
      draft.sortOrder = index;
      await db
        .update(cmsExperts)
        .set({
          draft,
          updatedById: req.auth!.id,
          updatedAt: new Date(),
        })
        .where(eq(cmsExperts.id, row.id));
    }
    const refreshed = await db
      .select()
      .from(cmsExperts)
      .orderBy(asc(cmsExperts.id));
    refreshed.sort((a, b) => {
      const aOrder = expertDraftFromRow(a).sortOrder;
      const bOrder = expertDraftFromRow(b).sortOrder;
      return aOrder - bOrder || a.id - b.id;
    });
    res.json({
      experts: refreshed.map((row) => ({
        id: row.id,
        draft: expertDraftFromRow(row),
        published: publishedExpertFromRow(row),
      })),
    });
  } catch (error) {
    console.error("Failed to reorder experts:", error);
    res.status(500).json({ error: "Unable to reorder experts." });
  }
});

cmsAdminRouter.put("/experts/:id", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid expert id." });
    return;
  }
  const parsed = validateExpertDraft(req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    const [updated] = await db
      .update(cmsExperts)
      .set({
        slug: parsed.value.slug,
        draft: parsed.value,
        updatedById: req.auth!.id,
        updatedAt: new Date(),
      })
      .where(eq(cmsExperts.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Expert not found." });
      return;
    }
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.expert.update",
      resourceType: "cms_expert",
      resourceId: String(id),
      req,
    });
    res.json({
      expert: {
        id: updated.id,
        draft: expertDraftFromRow(updated),
        published: publishedExpertFromRow(updated),
      },
    });
  } catch (error) {
    console.error("Failed to update expert:", error);
    res.status(500).json({ error: "Unable to update expert." });
  }
});

cmsAdminRouter.delete("/experts/:id", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ error: "Invalid expert id." });
    return;
  }
  try {
    const deleted = await db
      .delete(cmsExperts)
      .where(eq(cmsExperts.id, id))
      .returning({ id: cmsExperts.id });
    if (!deleted.length) {
      res.status(404).json({ error: "Expert not found." });
      return;
    }
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.expert.delete",
      resourceType: "cms_expert",
      resourceId: String(id),
      req,
    });
    res.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete expert:", error);
    res.status(500).json({ error: "Unable to delete expert." });
  }
});

cmsAdminRouter.post("/experts/publish", async (req, res) => {
  if (!(await assertContentPermission(req, res, "canEditPages"))) {
    return;
  }
  try {
    await ensureExpertsSeeded(req.auth?.id);
    const rows = await db.select().from(cmsExperts);
    const now = new Date();
    for (const row of rows) {
      const draft = expertDraftFromRow(row);
      await db
        .update(cmsExperts)
        .set({
          slug: draft.slug,
          name: draft.name,
          title: draft.title,
          photoUrl: draft.photoUrl ?? null,
          initials: draft.initials ?? null,
          portrait: draft.portrait ?? "male",
          email: draft.email ?? null,
          linkedin: draft.linkedin ?? null,
          summary: draft.summary ?? null,
          specialistAreas: draft.specialistAreas ?? [],
          experience: draft.experience ?? [],
          qualifications: draft.qualifications ?? [],
          memberships: draft.memberships ?? [],
          published: draft.published,
          sortOrder: draft.sortOrder,
          publishedAt: now,
          updatedById: req.auth!.id,
          updatedAt: now,
        })
        .where(eq(cmsExperts.id, row.id));
    }
    const published = await db
      .select()
      .from(cmsExperts)
      .orderBy(asc(cmsExperts.sortOrder), asc(cmsExperts.id));
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.experts.publish",
      resourceType: "cms_experts",
      req,
    });
    res.json({ experts: published.map(publishedExpertFromRow) });
  } catch (error) {
    console.error("Failed to publish experts:", error);
    res.status(500).json({ error: "Unable to publish experts." });
  }
});

function isCmsGlobalKey(
  key: string,
): key is "nav" | "footer" | "policies" | "notice" {
  return key === "nav" || key === "footer" || key === "policies" || key === "notice";
}

function validateGlobalContent(
  key: "nav" | "footer" | "policies" | "notice",
  input: unknown,
) {
  if (key === "nav") return validateNavContent(input);
  if (key === "footer") return validateFooterContent(input);
  if (key === "notice") return validateSiteNoticeContent(input);
  return validatePoliciesContent(input);
}

cmsAdminRouter.get("/globals/:key", async (req, res) => {
  const key = String(req.params.key ?? "");
  if (!isCmsGlobalKey(key)) {
    res.status(404).json({ error: "Unknown global." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsGlobalKey(key)))) {
    return;
  }
  try {
    const row = await ensureGlobalDraft(key, req.auth?.id);
    res.json({
      global: {
        key: row.key,
        draftContent: row.draftContent,
        publishedContent: row.publishedContent,
        publishedAt: row.publishedAt,
        updatedAt: row.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to load CMS global:", error);
    res.status(500).json({ error: "Unable to load content." });
  }
});

cmsAdminRouter.put("/globals/:key", async (req, res) => {
  const key = String(req.params.key ?? "");
  if (!isCmsGlobalKey(key)) {
    res.status(404).json({ error: "Unknown global." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsGlobalKey(key)))) {
    return;
  }
  const parsed = validateGlobalContent(key, req.body?.content ?? req.body);
  if (!parsed.ok) {
    res.status(400).json({ error: parsed.error });
    return;
  }
  try {
    await ensureGlobalDraft(key, req.auth?.id);
    const [updated] = await db
      .update(cmsGlobals)
      .set({
        draftContent: parsed.value,
        updatedById: req.auth!.id,
        updatedAt: new Date(),
      })
      .where(eq(cmsGlobals.key, key))
      .returning();
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.global.save",
      resourceType: "cms_global",
      resourceId: key,
      req,
    });
    res.json({
      global: {
        key: updated.key,
        draftContent: updated.draftContent,
        publishedContent: updated.publishedContent,
        publishedAt: updated.publishedAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to save CMS global:", error);
    res.status(500).json({ error: "Unable to save content." });
  }
});

cmsAdminRouter.post("/globals/:key/publish", async (req, res) => {
  const key = String(req.params.key ?? "");
  if (!isCmsGlobalKey(key)) {
    res.status(404).json({ error: "Unknown global." });
    return;
  }
  if (!(await assertContentPermission(req, res, permissionForCmsGlobalKey(key)))) {
    return;
  }
  try {
    const row = await ensureGlobalDraft(key, req.auth?.id);
    const parsed = validateGlobalContent(key, row.draftContent);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    let publishedValue = parsed.value;
    if (key === "notice") {
      const notice = parsed.value as SiteNoticeContent;
      publishedValue = {
        ...notice,
        id: crypto.randomUUID(),
      };
      await db
        .update(cmsGlobals)
        .set({
          draftContent: publishedValue,
          updatedById: req.auth!.id,
          updatedAt: new Date(),
        })
        .where(eq(cmsGlobals.key, key));
    }
    const now = new Date();
    const [updated] = await db
      .update(cmsGlobals)
      .set({
        publishedContent: publishedValue,
        publishedAt: now,
        updatedById: req.auth!.id,
        updatedAt: now,
      })
      .where(eq(cmsGlobals.key, key))
      .returning();
    await writeAuditLog({
      userId: req.auth?.id,
      action: "cms.global.publish",
      resourceType: "cms_global",
      resourceId: key,
      req,
    });
    res.json({
      global: {
        key: updated.key,
        draftContent: updated.draftContent,
        publishedContent: updated.publishedContent,
        publishedAt: updated.publishedAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to publish CMS global:", error);
    res.status(500).json({ error: "Unable to publish content." });
  }
});

cmsAdminRouter.post("/media", parseCmsMediaUpload, async (req, res) => {
  if (
    !(await assertContentPermission(req, res, [
      "canEditHome",
      "canEditPages",
      "canEditMenusFooter",
    ]))
  ) {
    return;
  }
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "Choose an image to upload." });
    return;
  }
  try {
    const allowed = await isAllowedImageFile(file.path, file.mimetype);
    if (!allowed) {
      await discardUploadedFile(file.path);
      res.status(400).json({ error: "Use a JPEG, PNG, or WebP image." });
      return;
    }
    const stored = await persistCmsMediaUpload(file);
    res.status(201).json({ url: stored.url });
  } catch (error) {
    await discardUploadedFile(file.path);
    console.error("Failed to save CMS media:", error);
    res.status(500).json({ error: "Unable to save image." });
  }
});
