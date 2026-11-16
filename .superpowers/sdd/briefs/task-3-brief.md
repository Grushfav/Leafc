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
