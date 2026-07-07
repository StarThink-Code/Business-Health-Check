import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok } from "@bhc/api";
import { startAssessmentSchema, submitAssessmentSchema } from "@bhc/validation";
import { createDb } from "@bhc/database";
import type { Env } from "../env";
import { rateLimit } from "../middleware/rate-limit";
import { verifyTurnstileToken } from "../services/turnstile";
import { loadQuestions } from "../services/questions.service";
import { createAssessment, submitAssessment, getAssessmentReport } from "../services/assessment.service";
import { HTTPException } from "hono/http-exception";

export const assessmentRoutes = new Hono<{ Bindings: Env }>();

assessmentRoutes.get("/questions", async (c) => {
  const db = createDb(c.env.DB);
  const questions = await loadQuestions(db, { activeOnly: true });
  return c.json(ok({ questions }));
});

assessmentRoutes.post(
  "/assessment/start",
  rateLimit({ key: "assessment-start", limit: 10, windowSeconds: 60 }),
  zValidator("json", startAssessmentSchema),
  async (c) => {
    const { business, turnstileToken } = c.req.valid("json");

    const verified = await verifyTurnstileToken(
      turnstileToken,
      c.env.TURNSTILE_SECRET_KEY,
      c.req.header("cf-connecting-ip"),
    );
    if (!verified) {
      throw new HTTPException(400, { message: "Verification failed. Please retry." });
    }

    const db = createDb(c.env.DB);
    const assessmentId = await createAssessment(db, business);
    return c.json(ok({ assessmentId }));
  },
);

assessmentRoutes.post(
  "/assessment/submit",
  rateLimit({ key: "assessment-submit", limit: 20, windowSeconds: 60 }),
  zValidator("json", submitAssessmentSchema),
  async (c) => {
    const input = c.req.valid("json");
    const db = createDb(c.env.DB);
    const reportId = await submitAssessment(db, input);
    return c.json(ok({ reportId }));
  },
);

assessmentRoutes.get("/report/:id", async (c) => {
  const db = createDb(c.env.DB);
  const report = await getAssessmentReport(db, c.req.param("id"));
  return c.json(ok(report));
});
