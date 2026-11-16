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
