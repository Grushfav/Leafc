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
