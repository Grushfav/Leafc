import { Router } from "express";
import { and, count, eq, inArray, ne } from "drizzle-orm";
import { cases, serviceInquiries, trainingSessions, users } from "../db/schema.js";
import { db } from "../db/index.js";
import {
  isAdminRole,
  isStaffRole,
  requireAuth,
  STAFF_ROLES,
} from "../middleware/auth.js";
import { memberVisibleCaseIds } from "./cases.js";

export const dashboardRouter = Router();

async function countOpenCases(auth: { id: number; role: string }) {
  if (isAdminRole(auth.role)) {
    const [row] = await db
      .select({ value: count() })
      .from(cases)
      .where(ne(cases.status, "completed"));
    return row.value;
  }

  const ids = await memberVisibleCaseIds(auth.id);
  if (ids.length === 0) return 0;

  const [row] = await db
    .select({ value: count() })
    .from(cases)
    .where(and(inArray(cases.id, ids), ne(cases.status, "completed")));
  return row.value;
}

dashboardRouter.get("/summary", requireAuth, async (req, res) => {
  try {
    if (isStaffRole(req.auth!.role)) {
      const [inquiryTotal] = await db
        .select({ value: count() })
        .from(serviceInquiries);
      const [newInquiries] = await db
        .select({ value: count() })
        .from(serviceInquiries)
        .where(eq(serviceInquiries.status, "new"));
      const [memberTotal] = await db
        .select({ value: count() })
        .from(users)
        .where(inArray(users.role, [...STAFF_ROLES]));
      // Org-wide: scheduled + completed. Cancelled sessions are excluded so they
      // do not inflate the staff KPI (same visibility as GET /training/sessions).
      const [sessionTotal] = await db
        .select({ value: count() })
        .from(trainingSessions)
        .where(ne(trainingSessions.status, "cancelled"));
      const openCases = await countOpenCases(req.auth!);

      res.json({
        kind: "staff",
        inquiries: inquiryTotal.value,
        openCases,
        newInquiries: newInquiries.value,
        members: memberTotal.value,
        trainingSessions: sessionTotal.value,
      });
      return;
    }

    const [mine] = await db
      .select({ value: count() })
      .from(serviceInquiries)
      .where(eq(serviceInquiries.email, req.auth!.email));

    res.json({
      kind: "customer",
      inquiries: mine.value,
    });
  } catch (error) {
    console.error("Failed to load dashboard summary:", error);
    res.status(500).json({ error: "Unable to load dashboard summary." });
  }
});
