import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey();
const timestamp = (name: string) =>
  text(name).notNull().default(sql`(CURRENT_TIMESTAMP)`);

/** Categories are admin-manageable so new assessment sections can be added without a migration. */
export const categories = sqliteTable(
  "categories",
  {
    id: id(),
    slug: text("slug").notNull(),
    label: text("label").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: timestamp("created_at"),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const questions = sqliteTable(
  "questions",
  {
    id: id(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    prompt: text("prompt").notNull(),
    helpText: text("help_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (t) => [index("questions_category_idx").on(t.categoryId)],
);

export const questionOptions = sqliteTable(
  "question_options",
  {
    id: id(),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    score: integer("score").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("question_options_question_idx").on(t.questionId)],
);

export const businesses = sqliteTable("businesses", {
  id: id(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  website: text("website"),
  country: text("country").notNull(),
  teamSize: text("team_size").notNull(),
  businessAge: text("business_age").notNull(),
  marketingBudget: text("marketing_budget"),
  createdAt: timestamp("created_at"),
});

/** in_progress | completed | abandoned */
export const assessments = sqliteTable(
  "assessments",
  {
    id: id(),
    businessId: text("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("in_progress"),
    overallScore: real("overall_score"),
    businessStatus: text("business_status"),
    reportPdfKey: text("report_pdf_key"),
    startedAt: timestamp("started_at"),
    completedAt: text("completed_at"),
  },
  (t) => [index("assessments_business_idx").on(t.businessId)],
);

export const assessmentAnswers = sqliteTable(
  "assessment_answers",
  {
    id: id(),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "restrict" }),
    optionId: text("option_id")
      .notNull()
      .references(() => questionOptions.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at"),
  },
  (t) => [
    uniqueIndex("assessment_answers_unique_idx").on(t.assessmentId, t.questionId),
    index("assessment_answers_assessment_idx").on(t.assessmentId),
  ],
);

/**
 * Recommendation rules. `categoryId` null means the rule is evaluated against
 * the overall score rather than a single category.
 * operator: lt | lte | gt | gte | eq
 */
export const recommendationRules = sqliteTable(
  "recommendation_rules",
  {
    id: id(),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "cascade" }),
    operator: text("operator").notNull(),
    threshold: real("threshold").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    priority: integer("priority").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: timestamp("created_at"),
  },
  (t) => [index("recommendation_rules_category_idx").on(t.categoryId)],
);

/**
 * Configurable business-health status bands (e.g. 90-100 = Excellent).
 * Seeded from packages/shared DEFAULT_BUSINESS_STATUS_THRESHOLDS; editable by admins.
 */
export const scoringConfig = sqliteTable("scoring_config", {
  id: id(),
  status: text("status").notNull(),
  label: text("label").notNull(),
  minScore: integer("min_score").notNull(),
  maxScore: integer("max_score").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: id(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at"),
  },
  (t) => [uniqueIndex("admin_users_email_idx").on(t.email)],
);

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: id(),
    adminUserId: text("admin_user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at"),
  },
  (t) => [index("audit_logs_admin_user_idx").on(t.adminUserId)],
);
