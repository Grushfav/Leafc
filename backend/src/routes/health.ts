import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await db.execute(sql`select 1`);
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ status: "error", database: "disconnected" });
  }
});
