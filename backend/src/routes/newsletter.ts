import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { newsletterSubscribers } from "../db/schema.js";
import { db } from "../db/index.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import {
  createNewsletterToken,
  hashNewsletterToken,
  sendNewsletterConfirmEmail,
  sendNewsletterWelcomeEmail,
} from "../lib/newsletter-mail.js";

export const newsletterRouter = Router();

const CONFIRM_MESSAGE =
  "Check your inbox to confirm your subscription. The link expires in 72 hours.";

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

newsletterRouter.post("/", async (req, res) => {
  const emailRaw = req.body?.email;
  const consent = req.body?.consent;
  const sourceRaw = req.body?.source;

  if (consent !== true) {
    res.status(400).json({
      error: "Consent is required.",
      fields: { consent: "Agree to receive emails before subscribing." },
    });
    return;
  }

  if (typeof emailRaw !== "string" || !isValidEmail(emailRaw.trim())) {
    res.status(400).json({
      error: "Enter a valid email address.",
      fields: { email: "Enter a valid email address." },
    });
    return;
  }

  const email = emailRaw.trim().toLowerCase();
  const source =
    typeof sourceRaw === "string" && sourceRaw.trim()
      ? sourceRaw.trim().slice(0, 40)
      : "homepage";
  const token = createNewsletterToken();
  const now = new Date();

  try {
    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existing?.status === "subscribed") {
      const unsubscribe = createNewsletterToken();
      await db
        .update(newsletterSubscribers)
        .set({
          unsubscribeTokenHash: unsubscribe.hash,
          updatedAt: now,
        })
        .where(eq(newsletterSubscribers.id, existing.id));
      await sendNewsletterWelcomeEmail({
        to: email,
        unsubscribeToken: unsubscribe.raw,
      });
      res.json({ message: CONFIRM_MESSAGE });
      return;
    }

    if (existing) {
      await db
        .update(newsletterSubscribers)
        .set({
          status: "pending",
          source,
          consentAt: now,
          confirmTokenHash: token.hash,
          confirmExpiresAt: token.expiresAt,
          confirmedAt: null,
          unsubscribeTokenHash: null,
          unsubscribedAt: null,
          updatedAt: now,
        })
        .where(eq(newsletterSubscribers.id, existing.id));
    } else {
      await db.insert(newsletterSubscribers).values({
        email,
        status: "pending",
        source,
        consentAt: now,
        confirmTokenHash: token.hash,
        confirmExpiresAt: token.expiresAt,
      });
    }

    const sent = await sendNewsletterConfirmEmail({ to: email, token: token.raw });
    if (!sent) {
      console.warn("Newsletter confirm link (mail not configured):", token.raw);
    }

    res.json({ message: CONFIRM_MESSAGE });
  } catch (error) {
    console.error("Failed to save newsletter subscription:", error);
    res.status(500).json({
      error: "Unable to subscribe right now. Please try again shortly.",
    });
  }
});

newsletterRouter.post("/confirm", async (req, res) => {
  const tokenRaw = req.body?.token;
  if (typeof tokenRaw !== "string" || tokenRaw.trim().length < 32) {
    res.status(400).json({ error: "This confirmation link is missing or incomplete." });
    return;
  }

  const hash = hashNewsletterToken(tokenRaw.trim());

  try {
    const [row] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.confirmTokenHash, hash))
      .limit(1);

    if (!row || row.status === "unsubscribed") {
      res.status(400).json({
        error: "This confirmation link is invalid. Request a new one from the homepage.",
      });
      return;
    }

    if (row.status === "subscribed") {
      res.json({ message: "This address is already subscribed." });
      return;
    }

    if (!row.confirmExpiresAt || row.confirmExpiresAt.getTime() < Date.now()) {
      res.status(400).json({
        error: "This confirmation link has expired. Request a new one from the homepage.",
      });
      return;
    }

    const unsubscribe = createNewsletterToken();
    const now = new Date();

    await db
      .update(newsletterSubscribers)
      .set({
        status: "subscribed",
        confirmedAt: now,
        confirmTokenHash: null,
        confirmExpiresAt: null,
        unsubscribeTokenHash: unsubscribe.hash,
        unsubscribedAt: null,
        updatedAt: now,
      })
      .where(eq(newsletterSubscribers.id, row.id));

    await sendNewsletterWelcomeEmail({
      to: row.email,
      unsubscribeToken: unsubscribe.raw,
    });

    res.json({
      message:
        "You are subscribed. We will email you about programmes, updates, and occasional promotions.",
    });
  } catch (error) {
    console.error("Failed to confirm newsletter subscription:", error);
    res.status(500).json({ error: "Unable to confirm this subscription right now." });
  }
});

newsletterRouter.post("/unsubscribe", async (req, res) => {
  const tokenRaw = req.body?.token;
  if (typeof tokenRaw !== "string" || tokenRaw.trim().length < 32) {
    res.status(400).json({ error: "This unsubscribe link is missing or incomplete." });
    return;
  }

  const hash = hashNewsletterToken(tokenRaw.trim());

  try {
    const [row] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.unsubscribeTokenHash, hash))
      .limit(1);

    if (!row) {
      res.status(400).json({ error: "This unsubscribe link is invalid." });
      return;
    }

    if (row.status !== "unsubscribed") {
      const now = new Date();
      await db
        .update(newsletterSubscribers)
        .set({
          status: "unsubscribed",
          unsubscribedAt: now,
          confirmTokenHash: null,
          confirmExpiresAt: null,
          updatedAt: now,
        })
        .where(eq(newsletterSubscribers.id, row.id));
    }

    res.json({ message: "You are unsubscribed. We will not send further newsletter emails." });
  } catch (error) {
    console.error("Failed to unsubscribe newsletter address:", error);
    res.status(500).json({ error: "Unable to unsubscribe right now." });
  }
});

export const newsletterAdminRouter = Router();

newsletterAdminRouter.use(requireAuth, requireAdmin);

newsletterAdminRouter.get("/subscribers", async (_req, res) => {
  try {
    const subscribers = await db
      .select({
        id: newsletterSubscribers.id,
        email: newsletterSubscribers.email,
        status: newsletterSubscribers.status,
        source: newsletterSubscribers.source,
        consentAt: newsletterSubscribers.consentAt,
        confirmedAt: newsletterSubscribers.confirmedAt,
        unsubscribedAt: newsletterSubscribers.unsubscribedAt,
        createdAt: newsletterSubscribers.createdAt,
      })
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt));

    res.json({ subscribers });
  } catch (error) {
    console.error("Failed to list newsletter subscribers:", error);
    res.status(500).json({ error: "Unable to load newsletter subscribers." });
  }
});
