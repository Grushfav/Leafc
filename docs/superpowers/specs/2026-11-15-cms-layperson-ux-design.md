# CMS Layperson UX Design

**Date:** 2026-11-15  
**Status:** Approved  
**Depends on:** Site CMS (`2026-11-15-site-cms-design.md`)

## Goal

Make the Website CMS editor understandable for non-technical staff so they can change page copy and images without seeing CMS internals (section type names, ambiguous publish wording).

## Locked decisions

| Topic | Choice |
|-------|--------|
| Audience | Everyone (admins and site content editors) uses the same simple editor; Advanced is tucked away |
| Approach | Progressive polish of the existing site-content dashboard (no parallel editor, no third-party builder) |
| Phase split | (1) Clarity → (2) Live preview pane → (3) Safer power |
| Page coverage in Phase 1 | All Website CMS pages |
| Sub-tabs | Pages · People · Menus · Footer |
| Click-to-edit on preview | Out of scope |
| Backend / schema | Unchanged — draft → preview → publish |

## Out of scope

- Public site visual redesign
- 2FA, CRM, fine-grained permissions
- Click-to-edit on the preview iframe
- Dual “simple vs admin” editor modes

## Phase 1 — Clarity

- Named blocks in the page map (e.g. Top banner, Who we are), derived from heading/label with friendly type fallback
- Plain field labels: Headline, Supporting text, Button text, Button link, Photo
- Publish bar: status chip + **Save** · **Preview** · **Make live**
- Status: `Unsaved` | `Saved draft (not live)` | `Live`
- Make live confirms: “This updates the public website.”
- Add block remains visible but uses human type labels (Advanced hide is Phase 3)

## Phase 2 — See what you edit

- Desktop: sticky iframe of `{publicPath}?preview=1` beside the editor
- After Save, reload the iframe
- Mobile: Preview button only (no cramped split)
- Scroll/highlight of selected block in preview is best-effort / optional

## Phase 3 — Safer power

- Common tasks strip (e.g. change homepage headline, update a person’s photo, edit Insights)
- Default UI: reorder + edit existing blocks only
- **Advanced** disclosure: Add block, Delete block, technical type name
- Same UI for admin and `site_content_editor`

## Success criteria

- A lay editor can change the Home headline → Save → Preview → Make live without seeing raw types like `cardGrid`
- Same clarity on About and division pages
- Advanced still allows add/remove when needed

## Architecture notes

- Primary surface: `frontend/app/dashboard/site-content/page.tsx`
- Extract helpers under `frontend/components/cms/` and `frontend/lib/cms/sectionLabels.ts`
- Reuse existing CMS admin APIs and `PUBLIC_PATH_BY_SLUG` + `?preview=1`
