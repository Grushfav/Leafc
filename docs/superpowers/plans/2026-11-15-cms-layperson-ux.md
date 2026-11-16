# CMS Layperson UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Site content editable by a layperson without showing CMS internals.

**Architecture:** Progressive polish of `frontend/app/dashboard/site-content/page.tsx` — same draft/preview/publish APIs, no schema changes. Extract small UI helpers under `frontend/components/cms/`. Audience B: one simple editor for everyone; Advanced tucked away in Phase 3.

**Tech Stack:** Next.js dashboard, existing CMS client in `frontend/lib/cms/api.ts`, preview via `PUBLIC_PATH_BY_SLUG` + `?preview=1`.

## Global Constraints

- Do not change CMS backend schema or publish model
- One UI for admins and site content editors
- Commits only when the user asks
- Do not edit the Cursor plan file in `.cursor/plans/`

---

## Phase 1 — Clarity

### Task 1: Spec already written

- [x] Design spec at `docs/superpowers/specs/2026-11-15-cms-layperson-ux-design.md`

### Task 2: Labels + PublishBar + BlockList

- [x] Add `frontend/lib/cms/sectionLabels.ts`
- [x] Add `frontend/components/cms/PublishBar.tsx`
- [x] Add `frontend/components/cms/BlockList.tsx`
- [x] Wire into site-content: tab renames, dirty status, plain field labels, human add-type labels
- [x] Typecheck + manual Save / Preview / Make live

## Phase 2 — Preview pane

- [x] Add `frontend/components/cms/PreviewPane.tsx`
- [x] Desktop split layout; reload after Save; mobile button only

## Phase 3 — Safer power

- [x] Add `frontend/components/cms/CommonTasks.tsx`
- [x] Advanced disclosure for Add / Delete / technical type
