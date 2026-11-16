# Task 3 Report: Public accept-invite + disable code signup + login guard

**Status:** DONE  
**Date:** 2026-11-16  
**Commits:** none (per project rule)

## Summary

Updated `backend/src/routes/auth.ts` only: public invite preview + accept endpoints (hashed token lookup, 48h expiry), login rejects pending invites with `invite_pending`, and `POST /register` returns `403 invite_only`. Accept returns JWT + `publicUser` (permissions via `publicUserColumns`).

## Changes

### `backend/src/routes/auth.ts`

**Imports**

- `hashInviteToken` from `../lib/invites.js`
- `writeAuditLog` already present from `../lib/audit.js`
- Removed unused invite-code helpers (`inviteCodeMatches`, `node:crypto` hash compare)

**`POST /register`**

- Always responds `403` with `code: "invite_only"` (staff accounts by admin invite only)
- Prior invite-code registration path removed (dead code broke `tsc` narrowing after early return)

**`POST /login`**

- Missing user → `401` Invalid email or password
- User with `!passwordHash` → `403` + `code: "invite_pending"`
- Otherwise existing password / staff / verified checks unchanged

**`GET /auth/invite/:token`**

- Hash raw token; lookup by `inviteTokenHash` only
- Used / missing password set → `400`
- Expired (`inviteExpiresAt` missing or `< now`) → `410`
- Success → `{ name, email, role, expiresAt }`

**`POST /auth/accept-invite`**

- Body `{ token, password }` (password min 8)
- Same used/expired rejection as GET
- Sets `passwordHash`, `emailVerifiedAt`, clears invite + email-verification fields, sets `lastLoginAt`
- Audit `user.invite.accept`
- Returns `{ token, user: publicUser(...) }` with permission columns

## Verification

```text
cd backend && npx tsc --noEmit
→ exit 0
```

## Concerns

- Login `invite_pending` fires for any user without `passwordHash` (not only those with a live invite token); cancelled pending rows without a password would get the same message.
- ~~Accept does not re-check `isActive`~~ **Fixed** (see below).
- Old frontend signup UI that posts to `/register` will now always get `invite_only` until Task 4/5 UI updates.

## Fix: inactive invite rejection (Task 3 finding)

**`GET /auth/invite/:token` and `POST /auth/accept-invite`**

- Invite row select now includes `isActive`.
- After invalid/used check, if `!row.isActive` → `403` with `{ error: "This invite is no longer available." }`.
- Prevents deactivated pending accounts from previewing or completing accept while a token is still on file.

**Verification (post-fix)**

```text
cd backend && npx tsc --noEmit
→ exit 0
```
