# Newsletter Broadcast Design

**Date:** 2026-11-16  
**Status:** Ready for review (Approach A decisions locked)  
**Depends on:** Staff auth + `canViewNewsletter`, SES `sendMail`, `newsletter_subscribers`, existing unsubscribe flow, audit log

## Goal

Staff with newsletter access compose a subject and body on the existing Newsletter dashboard and send it immediately to every **subscribed** address. Each message includes a working unsubscribe link. No drafts, send history, or scheduling in v1.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Audience | Newsletter subscribers (email broadcast), not staff/users |
| Approach | **A** — Compose & send now on existing Newsletter dashboard |
| Audience filter | `status = 'subscribed'` only (never pending / unsubscribed) |
| Who can send | Staff with `canViewNewsletter` (same gate as list) |
| Confirm before send | Dialog showing recipient count |
| Audit | `writeAuditLog` action `newsletter.broadcast` with subject + counts |
| Unsubscribe | Per-subscriber link in each email (existing public unsubscribe page) |
| Drafts / history / schedule | Out of scope for v1 |
| Mail stack | Reuse `sendMail` + `newsletter-mail` patterns (YAGNI) |

## Out of scope

- Drafts, templates library, send history UI, or scheduled sends
- HTML/rich-text editor beyond plain body text rendered like existing newsletter emails
- Segment filters (by source, date, etc.) — subscribed-only is the only filter
- Separate “broadcast permission”; do not introduce `canSendNewsletter`
- Queues, worker processes, or batch provider APIs beyond sequential `sendMail`
- Changing public signup / confirm / unsubscribe flows (except using them)
- Insight cover-photo work (separate track)

## Data model

No new tables or columns for v1.

Reuse `newsletter_subscribers` (`backend/src/db/schema.ts`):

- Send only rows where `status === "subscribed"`
- Continue storing only `unsubscribeTokenHash` (never persist raw tokens)
- At send time, **mint a fresh unsubscribe token per recipient** with `createNewsletterToken()` and put the raw token in that email’s unsubscribe URL — same helpers as welcome / re-subscribe mail in `backend/src/routes/newsletter.ts` and `backend/src/lib/newsletter-mail.ts`
- **Persist the new hash only after a successful `sendMail`** for that recipient, so a failed send does not invalidate the previous unsubscribe link

Rotating the token on success means older unsubscribe links from prior welcome/broadcast emails stop working for that address; the link in the email just delivered is valid. Acceptable for v1; avoids storing plaintext tokens or inventing a second unsubscribe scheme.

## API

Mount on existing `newsletterAdminRouter` (`/admin/newsletter`), which already applies `requireAuth` + `requireStaff` + `requirePermission("canViewNewsletter")`.

| Method | Path | Body / notes |
|--------|------|----------------|
| POST | `/admin/newsletter/broadcast` | `{ subject, body }` — both required non-empty trimmed strings |

Behaviour:

1. Validate `subject` and `body` (trim; reject empty; max subject 200 chars; max body 20_000 chars).
2. Load all subscribers with `status = 'subscribed'` (need `id` + `email` only).
3. If count is 0 → `400` with a clear error; write no audit log.
4. If mail is not configured (`isMailConfigured()` false) → `502` before the loop so the UI cannot claim success; write no audit log.
5. For each subscribed row, in sequence:
   - Create unsubscribe token (raw + hash)
   - Call `sendNewsletterBroadcastEmail` wrapping `sendMail` with subject, body, and unsubscribe URL via `emailSiteOrigin()` + `/newsletter/unsubscribe?token=…` (same URL shape as welcome mail)
   - On successful send only: update `unsubscribeTokenHash` (+ `updatedAt`)
   - Track sent vs failed (exception or `sendMail` returning `false`)
6. After the loop (whenever the send loop ran), `writeAuditLog`:
   - `action`: `"newsletter.broadcast"`
   - `resourceType`: `"newsletter"`
   - `userId`: `req.auth?.id`
   - `req`
   - `metadata`: `{ subject, attempted, sent, failed }` — no body, no emails, no tokens
7. Respond with `{ attempted, sent, failed }` and a short message. Do not return recipient email lists.
   - If `sent === 0` and `attempted > 0` → HTTP `502`
   - If `sent > 0` → HTTP `200` (even when some failed)

Keep existing `GET /admin/newsletter/subscribers` unchanged. Public `POST /newsletter`, `/confirm`, `/unsubscribe` unchanged.

## UI

### Dashboard → Newsletter (`frontend/app/dashboard/newsletter/page.tsx`)

Add a **Compose & send** card above or beside the existing recipient tools:

- Subject input
- Body textarea (plain text; newlines preserved in email)
- Primary **Send to subscribers** action
- Disable send when there are zero subscribed addresses, while a send is in flight, or when subject/body empty
- On click: `window.confirm` (existing dashboard pattern) with the **current subscribed count** from the loaded list, e.g. `Send this newsletter to N subscribed recipient(s)? This cannot be undone.`
- On confirm: `POST /admin/newsletter/broadcast` with auth token (extend `frontend/lib/content.ts` next to `fetchNewsletterSubscribers`)
- Success / partial notice: show `sent` / `failed` from the response; no list refresh required after send
- Keep **Copy subscribed emails** for one-off / external use; broadcast does not remove it

No new routes or nav items. Same `canViewNewsletter` gate already used by the page.

## Email

Add `sendNewsletterBroadcastEmail` in `backend/src/lib/newsletter-mail.ts`, reusing `sendMail` + `escapeHtml` + `emailSiteOrigin()`:

- **Subject:** exactly as entered by staff (no automatic prefix)
- **Text:** body + blank line + “Unsubscribe at any time:” + unsubscribe URL + “LEAF-C”
- **HTML:** escape body, convert newlines to `<br>`, plus unsubscribe `<a>`, same footer tone as welcome mail
- **Unsubscribe URL:** `{emailSiteOrigin()}/newsletter/unsubscribe?token={raw}` — public page already posts to `/newsletter/unsubscribe`

No attachments, no per-recipient personalization beyond unsubscribe link.

## Error handling

| Case | Behaviour |
|------|-----------|
| Missing / empty subject or body | 400 |
| Subject/body over max length | 400 |
| Zero subscribed recipients | 400; UI disables send when count is 0 |
| SES / SMTP not configured | `502` before loop; no audit |
| Partial send failures | Continue remaining recipients; response + audit include `sent` and `failed`; HTTP `200` if any sent |
| All sends fail (`sent === 0`, `attempted > 0`) | Audit with counts; HTTP `502` |
| Unauthorized / no `canViewNewsletter` | Existing middleware 401/403 |
| Double-click / concurrent sends | UI disables while in flight; no server-side lock in v1 |

## Security notes

- Same permission as listing subscribers (`canViewNewsletter`); staff auth required
- Never email pending or unsubscribed rows; re-query `subscribed` at send time (do not trust a client-supplied recipient list)
- Store only unsubscribe token hashes; rotate per broadcast send as above
- Escape HTML in body/subject for HTML part; treat body as untrusted staff input
- Do not log full recipient lists or raw tokens in audit metadata
- Confirm dialog is UX guardrail only; server remains authoritative for audience

## Testing / verification

- Staff with `canViewNewsletter` can open compose UI; staff without cannot reach page / get 403 on broadcast
- Confirm dialog shows subscribed count; cancel does not call API
- Broadcast emails only `subscribed` rows; pending and unsubscribed untouched
- Each delivered message contains a working unsubscribe link; using it sets status to `unsubscribed` and excludes that address from the next broadcast
- Audit row `newsletter.broadcast` recorded with subject + attempted/sent/failed
- Mail not configured → clear failure, no false success
- Partial failure path reports both counts
- Existing copy-emails and subscriber filters still work
