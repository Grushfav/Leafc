import "dotenv/config";
import path from "node:path";
import { mkdirSync } from "node:fs";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { inquiriesRouter } from "./routes/inquiries.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { casesRouter } from "./routes/cases.js";
import { trainingRouter } from "./routes/training.js";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";
const uploadsRoot = path.join(process.cwd(), "uploads");

mkdirSync(path.join(uploadsRoot, "avatars"), { recursive: true });

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());
app.use("/uploads", express.static(uploadsRoot));

app.get("/", (_req, res) => {
  res.json({ message: "Leafc API" });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/inquiries", inquiriesRouter);
app.use("/dashboard", dashboardRouter);
app.use("/cases", casesRouter);
app.use("/training", trainingRouter);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
