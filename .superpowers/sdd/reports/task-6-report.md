# Task 6 Report: Accept-invite page + retire public signup form

**Status:** DONE  
**Date:** 2026-11-16  
**Commits:** none (per task instruction)

## Summary

Added `/accept-invite` with password setup via `AuthProvider.completeInvite`, and replaced the public signup form with invitation-only messaging plus links to login and Get Started.

## Changes

### `frontend/components/auth/AuthProvider.tsx`

- Import `acceptInvite`
- Add `completeInvite(rawToken, password)`: calls `acceptInvite`, staff-role guard (same as login), then `storeToken` + `setToken` + `setUser`
- Expose `completeInvite` on context

### `frontend/components/auth/AcceptInviteForm.tsx` (new)

- `useSearchParams` for `token`; Suspense wrapper (same pattern as VerifyEmailForm)
- On mount `fetchInvite(token)` → show name, email, `roleLabel(role)`
- Password + confirm; validate match + min 8
- Submit via `useAuth().completeInvite` → `router.replace("/dashboard")`
- Surfaces API error messages for invalid/expired invites (400/410)

### `frontend/app/(public)/accept-invite/page.tsx` (new)

- Mirrors verify-email / login: PageHero + card shell around `AcceptInviteForm`

### `frontend/app/(public)/signup/page.tsx`

- Removed `SignupForm`
- Invitation-only copy; links to `/login` and `/get-started` (no `/contact` route in app)

### `frontend/app/sitemap.ts`

- Added `/accept-invite` alongside other auth pages

## Verification

```text
cd frontend; npx tsc --noEmit
→ exit 0
```

## Notes

- End-to-end smoke (admin invite → accept → dashboard → re-login) not run in this session; typecheck only.
- `SignupForm.tsx` left in place but unused by the signup page.
