import "dotenv/config";
import cors from "cors";
import express from "express";
import { healthRouter } from "./routes/health.js";
import { inquiriesRouter } from "./routes/inquiries.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Leafc API" });
});

app.use("/health", healthRouter);
app.use("/inquiries", inquiriesRouter);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
