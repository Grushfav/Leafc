# Task 1 Report: Schema + invite mail helper

**Status:** DONE  
**Date:** 2026-11-16  
**Branch:** feature/member-invites  
**Commits:** none (per project rule)

## Summary

Added `invite_token_hash` and `invite_expires_at` columns on the `users` table and introduced `backend/src/lib/invites.ts` with token generation (SHA-256 hash storage), 48-hour TTL constant, and member invite email delivery via existing `sendMail` / `emailSiteOrigin` helpers.

## Changes

### `backend/src/db/schema.ts`

- After `emailVerificationExpiresAt`, added:
  - `inviteTokenHash: text("invite_token_hash")`
  - `inviteExpiresAt: timestamp("invite_expires_at")`

### `backend/src/lib/invites.ts` (new)

Exported:

- `INVITE_TTL_MS` — `48 * 60 * 60 * 1000`
- `createInviteToken()` — 32-byte hex raw token, SHA-256 hash, `expiresAt`
- `hashInviteToken(raw)` — SHA-256 hex digest
- `sendMemberInviteEmail({ to, name, role, token })` — text/html invite with `/accept-invite?token=...` link; throws if SMTP not configured

Local duplicates: `roleLabel`, `escapeHtml` (not exported from `verification.ts`; YAGNI per brief).

## Verification

| Step | Command | Result |
|------|---------|--------|
| Schema push | `npm run db:push` (in `backend/`) | Exit 0 — "Changes applied" |
| Typecheck | `npx tsc --noEmit` (in `backend/`) | Exit 0 |

## Self-review

- **Brief fidelity:** Implementation matches brief verbatim for schema columns and `invites.ts` contents.
- **Security:** Only hashed tokens are produced for persistence (`hash` field); raw token is for email/link only.
- **TTL:** Single constant `INVITE_TTL_MS` used for `expiresAt`; email copy states 48 hours.
- **Scope:** Only files listed in brief were modified/created.
- **Concerns:** None. `escapeHtml` is duplicated from `verification.ts` by design; no shared export exists.

## Handoff for later tasks

Consumers can import from `backend/src/lib/invites.js` and persist `inviteTokenHash` + `inviteExpiresAt` on `users`. Public accept flow should hash incoming token and compare to `inviteTokenHash`.