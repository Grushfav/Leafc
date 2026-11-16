# Member Invites SDD Progress

Branch: feature/member-invites
Plan: docs/superpowers/plans/2026-11-16-member-invites.md
Started: 2026-11-16


Task 1: complete (working tree, no commit; review: invite deliverables OK; schema extras pre-existing WIP)

Task 2: complete (working tree; review clean; minors: orphan inviteStatus, rotate verification clear, mail-fail-after-rotate)

Task 3: complete (isActive fix applied; minors: invite_pending breadth, accept race)

Task 4: complete (tsc clean; helpers added)

Task 5: complete (review approved; manual browser QA deferred)

Task 6: complete (login copy fixed; backend tsc exit 0; e2e deferred to manual)

Minors for final: orphan inviteStatus, mail-fail-after-rotate, dead SignupForm.tsx, expiresAt unused in AcceptInviteForm

Final review: Important fixes applied (I-1,I-2,I-3,m-2); tsc clean both packages. Feature ready for manual smoke.

---

# Newsletter Broadcast SDD Progress

Branch: feature/member-invites (in place)
Plan: docs/superpowers/plans/2026-11-16-newsletter-broadcast.md
Started: 2026-11-16

Task 1: complete (working tree, no commit; `sendNewsletterBroadcastEmail` in newsletter-mail.ts; backend tsc exit 0)

Task 2: complete (working tree; POST /broadcast on newsletterAdminRouter + audit newsletter.broadcast; backend tsc exit 0)

Task 3: complete (working tree; `broadcastNewsletter` + NewsletterBroadcastResult in content.ts; frontend tsc exit 0)

Task 4: complete (working tree; Compose & send card + confirm dialog on newsletter dashboard; frontend tsc exit 0)

Task 5: complete (backend + frontend tsc exit 0; code review vs plan checklist OK; browser/SES smoke deferred to manual)

Self-review notes:
- Permission: existing canViewNewsletter middleware + page gate — no new permission
- Zero recipients / mail-not-configured: 400/502 before loop, no audit
- Token hash rotated only after successful send
- No schema / drafts / history / new nav
- Manual smoke still needed: confirm dialog cancel, real SES delivery, unsubscribe link, audit row

