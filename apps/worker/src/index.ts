import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Env } from "./env";
import { errorHandler } from "./middleware/error-handler";
import { assessmentRoutes } from "./routes/assessment.routes";
import { adminRoutes } from "./routes/admin.routes";

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());
app.use(
  "/api/*",
  cors({
    origin: (origin) => origin, // tighten to the deployed web app origin before production launch
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.onError(errorHandler);

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.route("/api", assessmentRoutes);
app.route("/api/admin", adminRoutes);

export default app;
