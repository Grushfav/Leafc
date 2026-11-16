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
