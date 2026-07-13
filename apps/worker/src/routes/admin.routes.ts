import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { ok } from "@bhc/api";
import {
  adminLoginSchema,
  questionInputSchema,
  categoryInputSchema,
  recommendationRuleInputSchema,
  createAdminUserSchema,
  updateAdminUserSchema,
} from "@bhc/validation";
import { createDb } from "@bhc/database";
import type { Env } from "../env";
import { rateLimit } from "../middleware/rate-limit";
import { requireAdmin, type AdminJwtPayload } from "../middleware/admin-auth";
import { loginAdmin } from "../services/admin-auth.service";
import {
  createQuestion,
  deleteQuestion,
  listAllQuestions,
  updateQuestion,
} from "../services/admin-questions.service";
import { listAssessments, getAssessmentDetail } from "../services/admin-assessments.service";
import { getAnalytics } from "../services/admin-analytics.service";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../services/admin-categories.service";
import {
  listRecommendationRules,
  createRecommendationRule,
  updateRecommendationRule,
  deleteRecommendationRule,
} from "../services/admin-recommendations.service";
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../services/admin-users.service";
import { recordAuditLog } from "../services/audit";

export const adminRoutes = new Hono<{ Bindings: Env; Variables: { admin: AdminJwtPayload } }>();

adminRoutes.post(
  "/login",
  rateLimit({ key: "admin-login", limit: 10, windowSeconds: 60 }),
  zValidator("json", adminLoginSchema),
  async (c) => {
    const { email, password } = c.req.valid("json");
    const db = createDb(c.env.DB);
    const ttl = Number(c.env.ADMIN_SESSION_TTL_SECONDS);
    const result = await loginAdmin(db, email, password, c.env.JWT_SECRET, ttl);
    return c.json(ok(result));
  },
);

adminRoutes.use("/*", requireAdmin);

adminRoutes.get("/questions", async (c) => {
  const db = createDb(c.env.DB);
  const questions = await listAllQuestions(db);
  return c.json(ok({ questions }));
});

adminRoutes.post("/questions", zValidator("json", questionInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = createDb(c.env.DB);
  const question = await createQuestion(db, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "question.create",
    entityType: "question",
    entityId: question.id,
  });
  return c.json(ok(question), 201);
});

adminRoutes.put("/questions/:id", zValidator("json", questionInputSchema), async (c) => {
  const input = c.req.valid("json");
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const question = await updateQuestion(db, id, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "question.update",
    entityType: "question",
    entityId: id,
  });
  return c.json(ok(question));
});

adminRoutes.delete("/questions/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await deleteQuestion(db, id);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "question.delete",
    entityType: "question",
    entityId: id,
  });
  return c.json(ok({ deleted: true }));
});

adminRoutes.get("/analytics", async (c) => {
  const db = createDb(c.env.DB);
  const analytics = await getAnalytics(db);
  return c.json(ok(analytics));
});

adminRoutes.get("/assessments", async (c) => {
  const db = createDb(c.env.DB);
  const page = Number(c.req.query("page") ?? "1");
  const pageSize = Number(c.req.query("pageSize") ?? "20");
  const result = await listAssessments(db, { page, pageSize });
  return c.json(ok(result));
});

adminRoutes.get("/assessments/:id", async (c) => {
  const db = createDb(c.env.DB);
  const detail = await getAssessmentDetail(db, c.req.param("id"));
  return c.json(ok(detail));
});

adminRoutes.get("/categories", async (c) => {
  const db = createDb(c.env.DB);
  const categories = await listCategories(db);
  return c.json(ok({ categories }));
});

adminRoutes.post("/categories", zValidator("json", categoryInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = createDb(c.env.DB);
  const category = await createCategory(db, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "category.create",
    entityType: "category",
    entityId: category.id,
  });
  return c.json(ok(category), 201);
});

adminRoutes.put("/categories/:id", zValidator("json", categoryInputSchema), async (c) => {
  const input = c.req.valid("json");
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const category = await updateCategory(db, id, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "category.update",
    entityType: "category",
    entityId: id,
  });
  return c.json(ok(category));
});

adminRoutes.delete("/categories/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await deleteCategory(db, id);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "category.delete",
    entityType: "category",
    entityId: id,
  });
  return c.json(ok({ deleted: true }));
});

adminRoutes.get("/recommendations", async (c) => {
  const db = createDb(c.env.DB);
  const rules = await listRecommendationRules(db);
  return c.json(ok({ rules }));
});

adminRoutes.post("/recommendations", zValidator("json", recommendationRuleInputSchema), async (c) => {
  const input = c.req.valid("json");
  const db = createDb(c.env.DB);
  const rule = await createRecommendationRule(db, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "recommendation.create",
    entityType: "recommendation_rule",
    entityId: rule.id,
  });
  return c.json(ok(rule), 201);
});

adminRoutes.put("/recommendations/:id", zValidator("json", recommendationRuleInputSchema), async (c) => {
  const input = c.req.valid("json");
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const rule = await updateRecommendationRule(db, id, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "recommendation.update",
    entityType: "recommendation_rule",
    entityId: id,
  });
  return c.json(ok(rule));
});

adminRoutes.delete("/recommendations/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await deleteRecommendationRule(db, id);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "recommendation.delete",
    entityType: "recommendation_rule",
    entityId: id,
  });
  return c.json(ok({ deleted: true }));
});

adminRoutes.get("/users", async (c) => {
  const db = createDb(c.env.DB);
  const users = await listAdminUsers(db);
  return c.json(ok({ users }));
});

adminRoutes.post("/users", zValidator("json", createAdminUserSchema), async (c) => {
  const input = c.req.valid("json");
  const db = createDb(c.env.DB);
  const user = await createAdminUser(db, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "admin_user.create",
    entityType: "admin_user",
    entityId: user.id,
  });
  return c.json(ok(user), 201);
});

adminRoutes.put("/users/:id", zValidator("json", updateAdminUserSchema), async (c) => {
  const input = c.req.valid("json");
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  const user = await updateAdminUser(db, id, input);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "admin_user.update",
    entityType: "admin_user",
    entityId: id,
  });
  return c.json(ok(user));
});

adminRoutes.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env.DB);
  await deleteAdminUser(db, id, c.get("admin").sub);
  await recordAuditLog(db, {
    adminUserId: c.get("admin").sub,
    action: "admin_user.delete",
    entityType: "admin_user",
    entityId: id,
  });
  return c.json(ok({ deleted: true }));
});
