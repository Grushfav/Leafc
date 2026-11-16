# Newsletter Broadcast Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Staff with `canViewNewsletter` compose a subject and body on the Newsletter dashboard and send immediately to every subscribed address, each with a working unsubscribe link.

**Architecture:** Extend existing `newsletterAdminRouter` with `POST /admin/newsletter/broadcast`. Reuse `sendMail` / `createNewsletterToken` / welcome-mail patterns. Mint a fresh unsubscribe token per recipient; persist the new hash only after a successful send. No drafts, history, or schema changes.

**Tech Stack:** Express + Drizzle/Neon, existing SES `sendMail`, Next.js App Router dashboard, `writeAuditLog`.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-11-16-newsletter-broadcast-design.md`
- Approach **A**: compose & send now; `status = 'subscribed'` only; `canViewNewsletter`; confirm dialog; audit `newsletter.broadcast`; unsubscribe links; **no** drafts / history / schema changes
- Reuse existing SES `sendMail` / newsletter-mail patterns (YAGNI — no new mail stack)
- Verification: **typecheck** (`npx tsc --noEmit` in `backend` and `frontend`); no jest in this repo
- Commits only when the user asks
- Do not edit Cursor plan files under `.cursor/plans/`

## File map

| File | Responsibility |
|------|----------------|
| `backend/src/lib/newsletter-mail.ts` | Add `sendNewsletterBroadcastEmail` (subject/body + unsubscribe URL) |
| `backend/src/routes/newsletter.ts` | `POST /broadcast` on `newsletterAdminRouter` |
| `frontend/lib/content.ts` | `broadcastNewsletter(token, { subject, body })` next to `fetchNewsletterSubscribers` |
| `frontend/app/dashboard/newsletter/page.tsx` | Compose & send card, confirm dialog, result notice |

No schema / migration / `db:push`. Public signup / confirm / unsubscribe routes stay unchanged.

---

### Task 1: Broadcast email helper

**Files:**
- Modify: `backend/src/lib/newsletter-mail.ts`

**Interfaces:**
- Consumes: `sendMail` (`Promise<boolean>`), `emailSiteOrigin()`, existing private `escapeHtml`
- Produces: `sendNewsletterBroadcastEmail({ to, subject, body, unsubscribeToken }): Promise<boolean>`

- [ ] **Step 1: Add `sendNewsletterBroadcastEmail`**

Append after `sendNewsletterWelcomeEmail` in `backend/src/lib/newsletter-mail.ts`:

```ts
export async function sendNewsletterBroadcastEmail(options: {
  to: string;
  subject: string;
  body: string;
  unsubscribeToken: string;
}): Promise<boolean> {
  const unsubscribeUrl = `${emailSiteOrigin()}/newsletter/unsubscribe?token=${encodeURIComponent(options.unsubscribeToken)}`;
  const htmlBody = escapeHtml(options.body).replaceAll("\n", "<br>");

  return sendMail({
    to: options.to,
    subject: options.subject,
    text: [
      options.body,
      "",
      "Unsubscribe at any time:",
      unsubscribeUrl,
      "",
      "LEAF-C",
    ].join("\n"),
    html: `
      <p>${htmlBody}</p>
      <p><a href="${escapeHtml(unsubscribeUrl)}">Unsubscribe</a></p>
      <p>LEAF-C</p>
    `,
  });
}
```

Notes:

- Subject is exactly as staff entered (no prefix) — matches welcome/confirm subject style for headers.
- Body is treated as untrusted: escape for HTML; newlines → `<br>`.
- Unsubscribe URL shape matches `sendNewsletterWelcomeEmail`.

- [ ] **Step 2: Typecheck backend**

Run in `backend/`:

```bash
npx tsc --noEmit
```

Expected: exit 0

---

### Task 2: Admin broadcast route

**Files:**
- Modify: `backend/src/routes/newsletter.ts`

**Interfaces:**
- Consumes: `sendNewsletterBroadcastEmail`, `createNewsletterToken`, `isMailConfigured` from `../lib/mailer.js`, `writeAuditLog` from `../lib/audit.js`, `eq` (already imported), `newsletterSubscribers`, `db`
- Produces: `POST /admin/newsletter/broadcast` (mounted via existing `app.use("/admin/newsletter", newsletterAdminRouter)` in `backend/src/index.ts`) responding `{ attempted, sent, failed, message }`
- Auth: already on router via `requireAuth` + `requireStaff` + `requirePermission("canViewNewsletter")` — do **not** add a new permission

- [ ] **Step 1: Extend imports**

At top of `backend/src/routes/newsletter.ts`:

```ts
import { writeAuditLog } from "../lib/audit.js";
import { isMailConfigured } from "../lib/mailer.js";
```

Update the newsletter-mail import:

```ts
import {
  createNewsletterToken,
  hashNewsletterToken,
  sendNewsletterBroadcastEmail,
  sendNewsletterConfirmEmail,
  sendNewsletterWelcomeEmail,
} from "../lib/newsletter-mail.js";
```

- [ ] **Step 2: Add `POST /broadcast` on `newsletterAdminRouter`**

Append after the existing `GET /subscribers` handler (still on `newsletterAdminRouter`):

```ts
const MAX_BROADCAST_SUBJECT = 200;
const MAX_BROADCAST_BODY = 20_000;

newsletterAdminRouter.post("/broadcast", async (req, res) => {
  const subjectRaw = req.body?.subject;
  const bodyRaw = req.body?.body;

  if (typeof subjectRaw !== "string" || typeof bodyRaw !== "string") {
    res.status(400).json({ error: "Subject and body are required." });
    return;
  }

  const subject = subjectRaw.trim();
  const body = bodyRaw.trim();

  if (!subject || !body) {
    res.status(400).json({ error: "Subject and body cannot be empty." });
    return;
  }

  if (subject.length > MAX_BROADCAST_SUBJECT) {
    res.status(400).json({
      error: `Subject must be at most ${MAX_BROADCAST_SUBJECT} characters.`,
    });
    return;
  }

  if (body.length > MAX_BROADCAST_BODY) {
    res.status(400).json({
      error: `Body must be at most ${MAX_BROADCAST_BODY} characters.`,
    });
    return;
  }

  try {
    const recipients = await db
      .select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
      })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.status, "subscribed"));

    if (recipients.length === 0) {
      res.status(400).json({ error: "There are no subscribed recipients to email." });
      return;
    }

    if (!isMailConfigured()) {
      res.status(502).json({
        error: "Email is not configured. Newsletter was not sent.",
      });
      return;
    }

    let sent = 0;
    let failed = 0;
    const attempted = recipients.length;

    for (const recipient of recipients) {
      const unsubscribe = createNewsletterToken();
      try {
        const ok = await sendNewsletterBroadcastEmail({
          to: recipient.email,
          subject,
          body,
          unsubscribeToken: unsubscribe.raw,
        });
        if (!ok) {
          failed += 1;
          continue;
        }
        const now = new Date();
        await db
          .update(newsletterSubscribers)
          .set({
            unsubscribeTokenHash: unsubscribe.hash,
            updatedAt: now,
          })
          .where(eq(newsletterSubscribers.id, recipient.id));
        sent += 1;
      } catch (error) {
        console.error("Newsletter broadcast send failed:", recipient.id, error);
        failed += 1;
      }
    }

    await writeAuditLog({
      userId: req.auth?.id,
      action: "newsletter.broadcast",
      resourceType: "newsletter",
      req,
      metadata: { subject, attempted, sent, failed },
    });

    const payload = {
      attempted,
      sent,
      failed,
      message:
        failed === 0
          ? `Sent to ${sent} subscribed recipient(s).`
          : `Sent to ${sent} of ${attempted}; ${failed} failed.`,
    };

    if (sent === 0) {
      res.status(502).json({
        error: "No messages were delivered.",
        ...payload,
      });
      return;
    }

    res.json(payload);
  } catch (error) {
    console.error("Failed to broadcast newsletter:", error);
    res.status(500).json({ error: "Unable to send the newsletter right now." });
  }
});
```

Behaviour locked by spec:

- Audience re-queried server-side (`subscribed` only) — never trust a client recipient list
- Zero recipients → `400`, **no** audit
- Mail not configured → `502` **before** loop, **no** audit
- Persist `unsubscribeTokenHash` only after successful `sendMail`
- After loop (whenever it ran): audit with `{ subject, attempted, sent, failed }` — no body, emails, or tokens
- `sent === 0 && attempted > 0` → `502` (audit already written); any `sent > 0` → `200` even if some failed

- [ ] **Step 3: Typecheck backend**

Run in `backend/`:

```bash
npx tsc --noEmit
```

Expected: exit 0

---

### Task 3: Frontend API client

**Files:**
- Modify: `frontend/lib/content.ts`

**Interfaces:**
- Consumes: existing `API_URL`, `authHeaders`, `parseJson`, `AuthError` pattern
- Produces: `broadcastNewsletter(token, { subject, body })` → `{ attempted, sent, failed, message }`

- [ ] **Step 1: Add client next to `fetchNewsletterSubscribers`**

In `frontend/lib/content.ts`, immediately after `fetchNewsletterSubscribers`:

```ts
export interface NewsletterBroadcastResult {
  attempted: number;
  sent: number;
  failed: number;
  message: string;
}

export async function broadcastNewsletter(
  token: string,
  payload: { subject: string; body: string },
): Promise<NewsletterBroadcastResult> {
  const response = await fetch(`${API_URL}/admin/newsletter/broadcast`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseJson<NewsletterBroadcastResult>(response);
}
```

`parseJson` already throws `AuthError` on non-OK responses (including `502` with `error`). Callers should catch and show `error.error`.

- [ ] **Step 2: Typecheck frontend**

Run in `frontend/`:

```bash
npx tsc --noEmit
```

Expected: exit 0 (or only pre-existing unrelated errors — new symbols must typecheck)

---

### Task 4: Compose & send UI

**Files:**
- Modify: `frontend/app/dashboard/newsletter/page.tsx`

**Interfaces:**
- Consumes: `broadcastNewsletter`, `NewsletterBroadcastResult` from `@/lib/content`; existing `counts.subscribed`, `token`, `setNotice`; `Input`, `Textarea`, `Button`, `Card*`
- Produces: Compose & send card on the Newsletter dashboard; no new routes or nav items

- [ ] **Step 1: Extend imports and local state**

Update content import:

```ts
import {
  broadcastNewsletter,
  fetchNewsletterSubscribers,
  type NewsletterSubscriber,
} from "@/lib/content";
```

Add:

```ts
import { Textarea } from "@/components/ui/Textarea";
```

Inside the component, after existing notice/loading state:

```ts
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
```

- [ ] **Step 2: Add `sendBroadcast` handler**

Place with other handlers (near `copyEmails`):

```ts
  async function sendBroadcast() {
    if (!token) return;
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    if (!trimmedSubject || !trimmedBody) return;
    if (counts.subscribed === 0) return;

    const confirmed = window.confirm(
      `Send this newsletter to ${counts.subscribed} subscribed recipient(s)? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsSending(true);
    setSendError(null);
    setNotice(null);
    try {
      const result = await broadcastNewsletter(token, {
        subject: trimmedSubject,
        body: trimmedBody,
      });
      setNotice(
        result.failed > 0
          ? `Sent ${result.sent} of ${result.attempted}; ${result.failed} failed.`
          : result.message,
      );
    } catch (error) {
      const authError = error as AuthError;
      setSendError(authError.error ?? "Unable to send the newsletter.");
    } finally {
      setIsSending(false);
    }
  }
```

Disable rules (match spec):

```ts
  const canSend =
    counts.subscribed > 0 &&
    subject.trim().length > 0 &&
    body.trim().length > 0 &&
    !isSending;
```

- [ ] **Step 3: Render Compose & send card**

Insert **after** the three count cards (`mt-6 grid …`) and **before** the Recipients card. Keep **Copy subscribed emails** in the header toolbar unchanged.

```tsx
      <Card variant="elevated" className="mt-6">
        <CardHeader>
          <CardTitle>Compose & send</CardTitle>
          <CardDescription>
            Email everyone who is currently subscribed. Each message includes an
            unsubscribe link. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Subject"
            value={subject}
            maxLength={200}
            placeholder="LEAF-C update"
            onChange={(event) => setSubject(event.target.value)}
          />
          <Textarea
            label="Body"
            value={body}
            rows={8}
            maxLength={20000}
            placeholder="Write the newsletter in plain text. Line breaks are kept in the email."
            onChange={(event) => setBody(event.target.value)}
          />
          {sendError && (
            <p className="text-sm text-error" role="alert">
              {sendError}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="accent"
              disabled={!canSend}
              onClick={() => void sendBroadcast()}
            >
              {isSending ? "Sending…" : "Send to subscribers"}
            </Button>
            <p className="text-xs text-muted-foreground">
              {counts.subscribed === 0
                ? "No subscribed recipients yet."
                : `${counts.subscribed} subscribed recipient${counts.subscribed === 1 ? "" : "s"}.`}
            </p>
          </div>
        </CardBody>
      </Card>
```

Do **not** refresh the subscriber list after send (spec). Filters / copy-emails behaviour stay as-is.

- [ ] **Step 4: Typecheck frontend**

Run in `frontend/`:

```bash
npx tsc --noEmit
```

Expected: exit 0 for new code

---

### Task 5: Manual verification checklist

**Files:** none (smoke against running backend + frontend)

- [ ] **Step 1: Permission gate**

- Staff **with** `canViewNewsletter`: open `/dashboard/newsletter`, see Compose & send
- Staff **without**: redirected from page; `POST /admin/newsletter/broadcast` returns 403

- [ ] **Step 2: Confirm dialog**

- Empty subject/body or zero subscribed → Send disabled
- Click Send → confirm shows current subscribed count; Cancel → no network call to `/broadcast`

- [ ] **Step 3: Audience + unsubscribe**

- Only `subscribed` rows receive mail; pending / unsubscribed untouched
- Delivered message contains `/newsletter/unsubscribe?token=…`
- Completing unsubscribe sets status `unsubscribed`; that address is excluded from the next broadcast
- Failed send for a recipient does **not** rotate that row’s `unsubscribeTokenHash`

- [ ] **Step 4: Audit + mail config**

- Successful / partial / all-fail after loop: `audit_logs` row with `action = newsletter.broadcast`, metadata `{ subject, attempted, sent, failed }` (no body/emails/tokens)
- Zero recipients or mail not configured: **no** audit row; UI shows clear error (400 / 502)
- Partial failure: HTTP 200 + both counts in notice; all fail after attempts: HTTP 502 + audit

- [ ] **Step 5: Regression**

- Copy subscribed emails still works
- Status filters / search still work
- Public signup / confirm / unsubscribe unchanged

- [ ] **Step 6: Typecheck both packages**

```bash
# backend/
npx tsc --noEmit

# frontend/
npx tsc --noEmit
```

Expected: exit 0 both

---

## Spec coverage check

| Spec item | Task |
|-----------|------|
| `sendNewsletterBroadcastEmail` + unsubscribe URL | 1 |
| Plain text + escaped HTML body, subject as entered | 1 |
| `POST /admin/newsletter/broadcast` on `newsletterAdminRouter` | 2 |
| Validate subject/body (trim, empty, max lengths) | 2 |
| Audience `subscribed` only; re-query server-side | 2 |
| Zero recipients → 400, no audit | 2 |
| `isMailConfigured` false → 502 before loop, no audit | 2 |
| Mint token; persist hash only after successful send | 2 |
| Sequential send; continue on failure; counts | 2 |
| Audit `newsletter.broadcast` with subject + counts | 2 |
| Response `{ attempted, sent, failed }`; 502 if none sent | 2 |
| `canViewNewsletter` only (existing middleware) | 2 (unchanged gate) |
| Frontend `broadcastNewsletter` client | 3 |
| Compose & send UI + confirm + disable rules | 4 |
| Keep copy-emails / filters; no new nav | 4 |
| Manual / typecheck verification | 5 |
| No drafts / history / schema / queues | Global — not implemented |

## Placeholder scan

None intentional — routes, helper signatures, UI copy, audit metadata, and status codes are fully specified above.

## Type consistency

- Helper: `sendNewsletterBroadcastEmail({ to, subject, body, unsubscribeToken }) → Promise<boolean>`
- Route body: `{ subject, body }`; response: `{ attempted, sent, failed, message }`
- Client: `broadcastNewsletter(token, { subject, body }) → NewsletterBroadcastResult` with the same numeric fields + `message`
- Audit action string: `"newsletter.broadcast"`; `resourceType: "newsletter"`
- Permission key: `"canViewNewsletter"` (no `canSendNewsletter`)
