# Final review — member invites

## Fixes applied (2026-11-16)

### Must fix

- **I-1 Accept atomicity** (`backend/src/routes/auth.ts`): accept-invite update now uses `and(eq(users.id, …), isNull(users.passwordHash), eq(users.inviteTokenHash, hash))`. No returning row → 400 `"This invite link is invalid or has already been used."`
- **I-2 Mail fail after rotate** (`backend/src/routes/users.ts`): rotate (`POST /invite` overwrite) and `POST /:id/resend-invite` restore previous `inviteTokenHash` / `inviteExpiresAt` on SES failure before 500. Non-production catch paths `console.info` the accept URL. New-user invite create also logs the URL before deleting the row.
- **I-3 Consistent pending predicate**: `inviteStatusOf` returns `"pending"` for any passwordless row. Cancel still uses that predicate (passwordless+token or passwordless without token). Overwrite/resend rotate sets `isActive: true`.
- **m-2 resend-verification guard** (`backend/src/routes/auth.ts`): resend only when `user.passwordHash` is set (skips pending invites).

### Nice-to-have

- Clear `emailVerificationToken` / `emailVerificationExpiresAt` on rotate and resend.
- Deleted unused `frontend/components/auth/SignupForm.tsx`.
- `AcceptInviteForm`: appends `" Ask an admin to resend."` on load/submit error messages.

### Verify

- `backend`: `npx tsc --noEmit` → **pass** (exit 0)
- `frontend`: `npx tsc --noEmit` → **pass** (exit 0)

No commit made.
