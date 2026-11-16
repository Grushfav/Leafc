# Member Invites Design

**Date:** 2026-11-16  
**Status:** Approved for implementation planning  
**Depends on:** Staff auth, SES mailer, admin Users page, audit log

## Goal

Admins invite staff members by email. The invitee receives a link, creates a password, then accesses the dashboard. The shared public invite-code signup is removed.

## Locked decisions

| Topic | Choice |
|-------|--------|
| Invite payload | Email + name + role (`agent` \| `senior_agent` \| `admin`) |
| Content grants | Not set at invite; admin configures on Users after join |
| Public signup | Replaced — no shared `MEMBER_INVITE_CODE` path |
| Approach | Pending `users` row + accept-invite link (no separate invites table) |
| Link TTL | 48 hours |
| On accept | Set password, clear invite token, treat email as verified, sign in |
| Who invites | Admin only |

## Out of scope

- Inviting customers / non-staff
- Setting fine-grained CMS grants on the invite form
- SSO / magic-link-only login without a password
- Bulk CSV invites

## Data model

Extend `users`:

- `invite_token_hash` (text, nullable) — SHA-256 of raw token (same hashing pattern as email verification)
- `invite_expires_at` (timestamp, nullable)

**Pending invite** means: staff role, `password_hash` is null, `invite_token_hash` is set.

On invite create/resend:

1. Upsert or insert user with name, email, role; `password_hash = null`
2. Generate raw token; store hash + `invite_expires_at = now + 48h`
3. Clear legacy email-verification token fields if present
4. Send invite email with raw token in URL
5. Write audit `user.invite` or `user.invite.resend`

On accept:

1. Validate token (hash match, not expired, password still null)
2. Set `password_hash`, set `email_verified_at` if null, clear invite fields
3. Write audit `user.invite.accept`
4. Return JWT + public user (same shape as login)

On cancel (pending only):

1. Delete the user row (or hard-cancel by clearing token and deactivating — prefer **delete** if never activated, to free the email)
2. Audit `user.invite.cancel`

Login rejects users with no `password_hash` (pending invite) with a clear message.

## API

### Admin (`requireAuth` + `requireAdmin`)

| Method | Path | Body / notes |
|--------|------|----------------|
| POST | `/admin/users/invite` | `{ name, email, role }` — create pending user + email; if same email is already pending, rotate token and resend; if active user exists, 409 |
| POST | `/admin/users/:id/resend-invite` | Pending only — new token, 48h, email |
| DELETE | `/admin/users/:id` | Pending only — cancel invite |
| GET | `/admin/users` | Include `inviteStatus`: `pending` \| `active`, `inviteExpiresAt` |

Existing permissions PATCH unchanged for active users.

### Public auth

| Method | Path | Notes |
|--------|------|--------|
| GET | `/auth/invite/:token` | Returns `{ name, email, role, expiresAt }` or 400/410 |
| POST | `/auth/accept-invite` | `{ token, password }` — min 8 chars; returns `{ token, user }` |

Remove or disable: register-with-invite-code path that depends on `MEMBER_INVITE_CODE`.

## UI

### Dashboard → Users

- **Invite member** card: name, email, role select, Send invite
- List rows show Active / Pending invite (with expiry) / Inactive
- Pending actions: Resend, Cancel
- Active: existing permission toggles + last login

### `/accept-invite`

- Load token from query; show name, email, role
- Password + confirm; submit → store session → `/dashboard`
- Expired/invalid/used → error + “Ask an admin to resend”

### `/signup`

- No account creation. Short copy: membership is by invitation; link to login / contact.

## Email

Reuse `sendMail` / SES.

- Subject: `You're invited to LEAF-C`
- Body: greeting, role label, accept URL (`{origin}/accept-invite?token=…`), “expires in 48 hours”
- Resend uses the same template with a fresh token

## Error handling

| Case | Behaviour |
|------|-----------|
| Duplicate active email | 409 — already registered |
| Duplicate pending email on invite | Rotate token + resend (idempotent invite) |
| Expired token | 410 — ask admin to resend |
| Used / already has password | 400 — sign in instead |
| Cancel non-pending user | 400 |
| Mail send failure | 502/500; do not leave UI claiming success without a clear error (rollback token rotate or surface failure) |

## Security notes

- Store only token hashes
- 48h expiry; resend invalidates prior token
- Invite links over HTTPS in production origins
- Rate-limit accept/invite endpoints lightly if easy; otherwise rely on admin gate + expiry for v1
- Do not expose whether an email exists beyond existing auth patterns on public accept (generic errors where practical)

## Testing / verification

- Admin invite → email logged/sent → accept within 48h → login works
- Expired token rejected; resend works
- Cancel frees email for a new invite
- Active user permissions still editable
- `/signup` no longer creates accounts with invite code
- Audit rows for invite / resend / cancel / accept
