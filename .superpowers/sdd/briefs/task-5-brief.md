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
