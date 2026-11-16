# Member Invites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admins email personal staff invites; invitees set a password via a 48-hour link before accessing the dashboard; remove shared invite-code signup.

**Architecture:** Pending `users` rows (no `passwordHash`) hold a hashed invite token + expiry. Admin APIs create/resend/cancel; public accept endpoints set the password and return a JWT. Frontend: invite UI on Users, `/accept-invite` page, and a non-signup `/signup` message.

**Tech Stack:** Express + Drizzle/Neon, existing SES `sendMail`, Next.js App Router dashboard/auth pages, audit log helper.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-11-16-member-invites-design.md`
- Invite TTL: **48 hours** exactly
- Invite payload: **name + email + role** only (`agent` | `senior_agent` | `admin`)
- Content grants: **not** set on invite; Users page after join
- Replace shared `STAFF_INVITE_CODE` / public register-with-code path
- Store **hashed** tokens only (SHA-256, same pattern as email verification)
- Commits only when the user asks
- Do not edit Cursor plan files under `.cursor/plans/`

## File map

| File | Responsibility |
|------|----------------|
| `backend/src/db/schema.ts` | Add `inviteTokenHash`, `inviteExpiresAt` |
| `backend/src/lib/invites.ts` | Create/hash token, send invite email, TTL helper |
| `backend/src/routes/users.ts` | Invite / resend / cancel + list `inviteStatus` |
| `backend/src/routes/auth.ts` | GET invite preview, POST accept-invite; disable code register; reject login without password |
| `frontend/lib/cms/api.ts` (or `frontend/lib/auth.ts`) | Admin invite client + accept-invite client |
| `frontend/app/dashboard/users/page.tsx` | Invite form + pending actions |
| `frontend/app/(public)/accept-invite/page.tsx` | Password set form |
| `frontend/components/auth/AcceptInviteForm.tsx` | Form UI |
| `frontend/app/(public)/signup/page.tsx` | Invitation-only copy (no SignupForm) |
| `frontend/app/sitemap.ts` | Keep `/signup`; add `/accept-invite` if listing auth pages |

---

### Task 1: Schema + invite mail helper

**Files:**
- Modify: `backend/src/db/schema.ts`
- Create: `backend/src/lib/invites.ts`
- Run: `npm run db:push` in `backend/`

**Interfaces:**
- Produces: `createInviteToken()`, `hashInviteToken(raw)`, `sendMemberInviteEmail({ to, name, role, token })`, `INVITE_TTL_MS = 48 * 60 * 60 * 1000`

- [ ] **Step 1: Add columns on `users`**

In `backend/src/db/schema.ts`, after `emailVerificationExpiresAt`:

```ts
  inviteTokenHash: text("invite_token_hash"),
  inviteExpiresAt: timestamp("invite_expires_at"),
```

- [ ] **Step 2: Create `backend/src/lib/invites.ts`**

```ts
import { createHash, randomBytes } from "node:crypto";
import { sendMail } from "./mailer.js";
import { emailSiteOrigin } from "./site-origin.js";

export const INVITE_TTL_MS = 48 * 60 * 60 * 1000;

export function createInviteToken(): {
  raw: string;
  hash: string;
  expiresAt: Date;
} {
  const raw = randomBytes(32).toString("hex");
  return {
    raw,
    hash: hashInviteToken(raw),
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  };
}

export function hashInviteToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function roleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "senior_agent":
      return "Senior agent";
    case "agent":
      return "Agent";
    default:
      return role;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendMemberInviteEmail(options: {
  to: string;
  name: string;
  role: string;
  token: string;
}): Promise<void> {
  const origin = emailSiteOrigin();
  const acceptUrl = `${origin}/accept-invite?token=${encodeURIComponent(options.token)}`;
  const firstName = options.name.trim().split(/\s+/)[0] || "there";
  const role = roleLabel(options.role);

  const sent = await sendMail({
    to: options.to,
    subject: "You're invited to LEAF-C",
    text: [
      `Hello ${firstName},`,
      "",
      `You have been invited to join the LEAF-C workspace as ${role}.`,
      "Create your password using this link (expires in 48 hours):",
      "",
      acceptUrl,
      "",
      "If you were not expecting this invite, you can ignore this email.",
      "",
      "LEAF-C",
    ].join("\n"),
    html: `
      <p>Hello ${escapeHtml(firstName)},</p>
      <p>You have been invited to join the LEAF-C workspace as <strong>${escapeHtml(role)}</strong>.</p>
      <p><a href="${escapeHtml(acceptUrl)}">Create your password</a></p>
      <p>This link expires in 48 hours. If you were not expecting this invite, ignore this email.</p>
      <p>LEAF-C</p>
    `,
  });

  if (!sent) {
    throw new Error("SES SMTP is not configured.");
  }
}
```

Mirror `escapeHtml` from `verification.ts` if already exported there — prefer importing a shared helper only if one exists; otherwise keep local duplicate (YAGNI).

- [ ] **Step 3: Push schema**

Run: `npm run db:push`  
Working directory: `backend`  
Expected: Changes applied (new columns)

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit` in `backend`  
Expected: exit 0

---

### Task 2: Admin invite / resend / cancel + list status

**Files:**
- Modify: `backend/src/routes/users.ts`

**Interfaces:**
- Consumes: `createInviteToken`, `sendMemberInviteEmail` from `../lib/invites.js`
- Produces:
  - `POST /admin/users/invite` body `{ name, email, role }` → `{ user }`
  - `POST /admin/users/:id/resend-invite` → `{ user }`
  - `DELETE /admin/users/:id` pending only → `{ ok: true }`
  - List user includes `inviteStatus: "pending" | "active"`, `inviteExpiresAt: Date | null`

- [ ] **Step 1: Extend serializer**

```ts
function inviteStatusOf(row: {
  passwordHash?: string | null;
  inviteTokenHash?: string | null;
}): "pending" | "active" {
  if (!row.passwordHash && row.inviteTokenHash) return "pending";
  return "active";
}
```

Include `passwordHash` and `inviteTokenHash` / `inviteExpiresAt` in the admin select (do **not** return hash to client). Return `inviteStatus` and `inviteExpiresAt` only.

- [ ] **Step 2: Add `POST /invite` before `/:id` routes**

Validation:

- `name` non-empty string
- `email` valid pattern (same as auth)
- `role` in `STAFF_ROLES` via `isStaffRole`

Logic:

1. Normalize email to lowercase trim
2. Find existing by email
3. If exists and has `passwordHash` → `409` `{ error: "An account with this email already exists." }`
4. If exists and pending → rotate token, update name/role, send email, audit `user.invite.resend` (or `user.invite` if preferred for first-create only — use `user.invite` for create and `user.invite.resend` for rotate)
5. If not exists → insert staff user: `passwordHash: null`, invite hash/expiry, `emailVerifiedAt: null`, clear verification token fields, default permissions false
6. Send email; on mail failure → `500` with clear error (if insert was new, delete the row OR clear invite fields — prefer delete new row on mail failure)
7. Audit `user.invite`
8. Return serialized user

- [ ] **Step 3: Add `POST /:id/resend-invite`**

- Load user by id
- If missing → 404
- If has password → 400 `{ error: "This member already accepted their invite." }`
- Rotate token, send email, audit `user.invite.resend`

- [ ] **Step 4: Add `DELETE /:id` for cancel**

- Load user
- If not pending (`passwordHash` set OR no invite hash) → 400 `{ error: "Only pending invites can be cancelled." }`
- Delete row
- Audit `user.invite.cancel` with metadata `{ email }`
- `{ ok: true }`

- [ ] **Step 5: Typecheck backend**

Run: `npx tsc --noEmit` in `backend`  
Expected: exit 0

---

### Task 3: Public accept-invite + disable code signup + login guard

**Files:**
- Modify: `backend/src/routes/auth.ts`

**Interfaces:**
- Produces: `GET /auth/invite/:token` → `{ name, email, role, expiresAt }`
- Produces: `POST /auth/accept-invite` body `{ token, password }` → `{ token, user }` (same as login)
- Register with invite code: return `403`/`400` with message that signup is invite-only

- [ ] **Step 1: Add GET invite lookup**

```ts
authRouter.get("/invite/:token", async (req, res) => {
  const raw = String(req.params.token ?? "").trim();
  if (!raw) {
    res.status(400).json({ error: "Invite token is required." });
    return;
  }
  const hash = hashInviteToken(raw);
  try {
    const [row] = await db
      .select({
        name: users.name,
        email: users.email,
        role: users.role,
        passwordHash: users.passwordHash,
        inviteExpiresAt: users.inviteExpiresAt,
        inviteTokenHash: users.inviteTokenHash,
      })
      .from(users)
      .where(eq(users.inviteTokenHash, hash))
      .limit(1);

    if (!row || row.passwordHash) {
      res.status(400).json({ error: "This invite link is invalid or has already been used." });
      return;
    }
    if (!row.inviteExpiresAt || row.inviteExpiresAt.getTime() < Date.now()) {
      res.status(410).json({ error: "This invite link has expired. Ask an admin to resend it." });
      return;
    }

    res.json({
      name: row.name,
      email: row.email,
      role: row.role,
      expiresAt: row.inviteExpiresAt,
    });
  } catch (error) {
    console.error("Failed to load invite:", error);
    res.status(500).json({ error: "Unable to load invite." });
  }
});
```

- [ ] **Step 2: Add POST accept-invite**

- Validate token + password (min 8)
- Find by hash; reject used/expired same as GET
- `bcrypt.hash` password; set `passwordHash`, `emailVerifiedAt: new Date()`, clear `inviteTokenHash`, `inviteExpiresAt`, clear verification fields
- `writeAuditLog` `user.invite.accept`
- Return `signToken` + `publicUser` (must select permission columns)

- [ ] **Step 3: Login guard**

Where password is checked, if `!user.passwordHash`:

```ts
res.status(403).json({
  error: "This account is waiting for you to accept your invite email.",
  code: "invite_pending",
});
```

- [ ] **Step 4: Disable register-with-code**

At start of `POST /register` (after parsing), respond:

```ts
res.status(403).json({
  error: "Staff accounts are created by admin invite only. Ask a LEAF-C administrator.",
  code: "invite_only",
});
return;
```

Remove dead invite-code validation or leave unreachable — prefer early return to keep change small.

- [ ] **Step 5: Typecheck backend**

Run: `npx tsc --noEmit` in `backend`  
Expected: exit 0

---

### Task 4: Frontend API helpers

**Files:**
- Modify: `frontend/lib/cms/api.ts` (admin user helpers live here today)
- Modify: `frontend/lib/auth.ts`

**Interfaces:**
- Produces: `inviteAdminUser(token, { name, email, role })`, `resendAdminInvite(token, id)`, `cancelAdminInvite(token, id)`
- Produces: `fetchInvite(token)`, `acceptInvite(token, password)` → `AuthResponse`
- Extends `AdminUserRecord` with `inviteStatus`, `inviteExpiresAt`

- [ ] **Step 1: Extend `AdminUserRecord`**

```ts
inviteStatus: "pending" | "active";
inviteExpiresAt: string | null;
```

- [ ] **Step 2: Add admin invite functions** next to `updateUserPermissions`

```ts
export async function inviteAdminUser(
  token: string,
  payload: { name: string; email: string; role: string },
) {
  const response = await fetch(`${API_URL}/admin/users/invite`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function resendAdminInvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/users/${id}/resend-invite`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return parseJson<{ user: AdminUserRecord }>(response);
}

export async function cancelAdminInvite(token: string, id: number) {
  const response = await fetch(`${API_URL}/admin/users/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  return parseJson<{ ok: true }>(response);
}
```

- [ ] **Step 3: Add accept helpers in `frontend/lib/auth.ts`**

```ts
export async function fetchInvite(rawToken: string) {
  const response = await fetch(
    `${API_URL}/auth/invite/${encodeURIComponent(rawToken)}`,
  );
  return parseJson<{
    name: string;
    email: string;
    role: AccountRole;
    expiresAt: string;
  }>(response);
}

export async function acceptInvite(
  rawToken: string,
  password: string,
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/accept-invite`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ token: rawToken, password }),
  });
  return parseJson<AuthResponse>(response);
}
```

- [ ] **Step 4: Frontend typecheck**

Run: `npx tsc --noEmit` in `frontend`  
Expected: exit 0 (Users page may need optional fields until Task 5)

---

### Task 5: Users page — invite form + pending actions

**Files:**
- Modify: `frontend/app/dashboard/users/page.tsx`

- [ ] **Step 1: Add invite form state** at top of page (name, email, role default `agent`, submitting)

- [ ] **Step 2: Render Invite card above Staff access**

Fields: name, email, role select (`agent` / `senior_agent` / `admin`). Submit calls `inviteAdminUser`, prepends/refetches list, toast success/error.

- [ ] **Step 3: Per-user pending UI**

If `inviteStatus === "pending"`:

- Show “Pending invite” + expiry via `toLocaleString`
- Buttons: Resend (`resendAdminInvite`), Cancel (`cancelAdminInvite` with confirm)
- Hide permission checkboxes until active

If active: keep existing permission UI.

- [ ] **Step 4: Manual check**

Sign in as admin → invite a throwaway email → row shows Pending → Resend updates expiry.

- [ ] **Step 5: Typecheck frontend**

Run: `npx tsc --noEmit` in `frontend`  
Expected: exit 0

---

### Task 6: Accept-invite page + retire public signup form

**Files:**
- Create: `frontend/components/auth/AcceptInviteForm.tsx`
- Create: `frontend/app/(public)/accept-invite/page.tsx`
- Modify: `frontend/app/(public)/signup/page.tsx`
- Modify: `frontend/components/auth/AuthProvider.tsx` if needed to expose a way to store token after accept (use existing `storeToken` + `fetchCurrentUser` / login pattern from LoginForm)

- [ ] **Step 1: `AcceptInviteForm`**

- `useSearchParams` for `token`
- On mount `fetchInvite(token)` → show name, email, roleLabel
- Password + confirm fields; validate match + min 8
- On submit `acceptInvite` → `storeToken(result.token)` → refresh auth (same as LoginForm) → `router.replace("/dashboard")`
- Handle 410/400 messages

- [ ] **Step 2: Page shell**

Mirror `verify-email` / `login` layout (PageHero optional, card with form, Suspense for searchParams).

- [ ] **Step 3: Replace signup page content**

Remove `SignupForm`. Copy:

- Title: membership by invitation
- Body: ask a LEAF-C administrator for an invite; link to `/login` and `/contact` or Get Started

- [ ] **Step 4: AuthProvider**

If LoginForm uses `login()` from context, either:

- Add `acceptInviteAndSession(token, password)` on provider, or
- Call `storeToken` + existing reload path used after login

Match LoginForm exactly.

- [ ] **Step 5: End-to-end smoke**

1. Admin invites email  
2. Open accept link (or copy token from mail/logs)  
3. Set password → lands on dashboard  
4. Sign out / sign in works  
5. `/signup` does not create accounts  
6. Activity log shows invite + accept  

- [ ] **Step 6: Typecheck both packages**

Run:

```bash
# backend
npx tsc --noEmit
# frontend
npx tsc --noEmit
```

Expected: exit 0 both

---

## Spec coverage check

| Spec item | Task |
|-----------|------|
| Schema invite columns | 1 |
| 48h email + hash helpers | 1 |
| Admin invite/resend/cancel | 2 |
| List inviteStatus | 2 |
| GET/POST accept | 3 |
| Disable code signup | 3 |
| Login pending guard | 3 |
| Frontend API | 4 |
| Users UI | 5 |
| Accept page | 6 |
| Signup retired | 6 |
| Audit actions | 2, 3 |
| Grants not on invite | 2 (defaults false) |

## Placeholder scan

None intentional — mail failure rollback, exact routes, and UI states are specified above.
