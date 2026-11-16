# Task 4 Report: Frontend API helpers for member invites

**Status:** DONE  
**Date:** 2026-11-16  
**Commits:** none (per task instruction)

## Summary

Extended admin user types and CMS API helpers for invite lifecycle (invite, resend, cancel), and added public invite preview + accept helpers in `auth.ts`. No UI changes in this task (Task 5).

## Changes

### `frontend/lib/cms/api.ts`

**`AdminUserRecord`**

- Added `inviteStatus: "pending" | "active"`
- Added `inviteExpiresAt: string | null`

**Admin invite API**

- `inviteAdminUser(token, { name, email, role })` → `POST /admin/users/invite`
- `resendAdminInvite(token, id)` → `POST /admin/users/:id/resend-invite`
- `cancelAdminInvite(token, id)` → `DELETE /admin/users/:id`

Placed after `updateUserPermissions`, using existing `authHeaders` / `parseJson` patterns.

### `frontend/lib/auth.ts`

**Public invite flow**

- `fetchInvite(rawToken)` → `GET /auth/invite/:token` (encoded), returns `{ name, email, role, expiresAt }`
- `acceptInvite(rawToken, password)` → `POST /auth/accept-invite`, returns `AuthResponse`

## Verification

```text
cd frontend; npx tsc --noEmit
→ exit 0
```

## Notes

- Users dashboard (`app/dashboard/users/page.tsx`) still has no invite UI; types compile because it only consumes API responses typed as `AdminUserRecord` (no local mocks missing new fields).
- Task 5 should wire invite actions and accept-invite pages to these helpers.