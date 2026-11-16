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
