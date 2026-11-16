# Task 2 Report: Admin invite / resend / cancel + list status

**Status:** DONE  
**Date:** 2026-11-16  
**Branch:** feature/member-invites  
**Commits:** none (per project rule)

## Summary

Extended `backend/src/routes/users.ts` with admin member-invite APIs: create/rotate invite (`POST /invite`), dedicated resend (`POST /:id/resend-invite`), cancel pending invite (`DELETE /:id`), and list/serialize fields `inviteStatus` + `inviteExpiresAt`. Tokens come from Task 1 `createInviteToken` / `sendMemberInviteEmail`; only hashes are stored; content grants stay false on invite.

## Changes

### `backend/src/routes/users.ts` (only file modified)

**Imports**

- `createInviteToken`, `sendMemberInviteEmail` from `../lib/invites.js`
- `isStaffRole` from `../middleware/auth.js`
- Local `EMAIL_PATTERN` matching auth (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)

**Serializer**

- `inviteStatusOf(row)` → `"pending"` when `!passwordHash && inviteTokenHash`, else `"active"`
- `adminUserColumns` now selects `passwordHash`, `inviteTokenHash`, `inviteExpiresAt` (hashes/password never returned to client)
- `serializeAdminUser` adds `inviteStatus` and `inviteExpiresAt`

**Route order**

Registered before `/:id` param routes (alongside existing `/activity`):

1. `GET /`
2. `GET /activity`
3. `POST /invite`
4. `POST /:id/resend-invite`
5. `DELETE /:id`
6. `PATCH /:id`

**`POST /invite`**

- Validates non-empty `name`, email pattern, staff role via `isStaffRole`
- Normalizes email to lowercase trim
- Existing + `passwordHash` → `409` `"An account with this email already exists."`
- Existing without password → rotate token, update name/role, send mail, audit `user.invite.resend`
- New user → insert with `passwordHash: null`, invite hash/expiry, cleared verification fields, all `can_*` / `siteContentEditor` false; send mail; audit `user.invite`; `201`
- **Mail failure (new):** delete inserted row, `500`
- **Mail failure (existing pending rotate):** leave rotated token in DB, `500` (usable state for later resend once SMTP works; previous link invalidated)

**`POST /:id/resend-invite`**

- Missing → `404`
- Has password → `400` `"This member already accepted their invite."`
- Else create token → update DB → send → audit `user.invite.resend`
- **Mail failure after update:** leave new token, `500`

**`DELETE /:id`**

- Not pending (`passwordHash` set or no invite hash) → `400` `"Only pending invites can be cancelled."`
- Delete row, audit `user.invite.cancel` with `{ email }`, return `{ ok: true }`

## Verification

| Step | Command | Result |
|------|---------|--------|
| Typecheck | `npx tsc --noEmit` (in `backend/`) | Exit 0 |

No automated HTTP tests run (brief Step 5 only requires tsc).

## Self-review

- **Brief fidelity:** Endpoints, audits, serializer status, staff-only roles, hashed tokens, no grants on invite match the brief.
- **Route shadowing:** `/invite` and `/activity` registered before `/:id`.
- **Security:** Raw invite token only passed to email; client sees status + expiry only.
- **Scope:** Only `backend/src/routes/users.ts` (+ imports).

## Decisions / concerns

1. **Update-then-send:** Invite create (pending rotate), resend, and new-user all persist the new hash/expiry before `sendMemberInviteEmail`. On send failure after update for pending/resend, DB keeps the new token (old link dead); new-user path deletes the row instead.
2. **POST /invite + existing password-less row:** Treated as rotate/resend even if `inviteTokenHash` were null (edge orphan), to avoid unique-email insert failure.
3. **No runtime mail/SMTP integration test** in this task — depends on SES config when exercised manually.

## Handoff for later tasks

Admin list already exposes `inviteStatus` / `inviteExpiresAt` for the Users UI. Public accept-invite (auth routes) should hash the raw token and match `inviteTokenHash` / expiry, then set `passwordHash` and clear invite fields.
