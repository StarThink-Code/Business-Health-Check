import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { categories, recommendationRules, type Database } from "@bhc/database";
import type { AssessmentCategorySlug, RecommendationRule, ScoreComparisonOperator } from "@bhc/shared";
import type { RecommendationRuleInput } from "@bhc/validation";
import { newId } from "../lib/ids";
import { invalidateCachedReportPdfs } from "./pdf-cache.service";

async function resolveCategoryId(db: Database, categorySlug: string | null): Promise<string | null> {
  if (categorySlug === null) return null;
  const [category] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
  if (!category) {
    throw new HTTPException(400, { message: `Unknown category: ${categorySlug}` });
  }
  return category.id;
}

export async function listRecommendationRules(db: Database): Promise<RecommendationRule[]> {
  const [ruleRows, categoryRows] = await Promise.all([
    db.select().from(recommendationRules),
    db.select().from(categories),
  ]);

  return ruleRows
    .slice()
    .sort((a, b) => b.priority - a.priority)
    .map((r) => ({
      id: r.id,
      categorySlug: (categoryRows.find((c) => c.id === r.categoryId)?.slug as AssessmentCategorySlug) ?? null,
      operator: r.operator as ScoreComparisonOperator,
      threshold: r.threshold,
      title: r.title,
      description: r.description,
      priority: r.priority,
      isActive: r.isActive,
    }));
}

export async function createRecommendationRule(
  db: Database,
  input: RecommendationRuleInput,
): Promise<RecommendationRule> {
  const categoryId = await resolveCategoryId(db, input.categorySlug);
  const id = newId("rule");

  await db.insert(recommendationRules).values({
    id,
    categoryId,
    operator: input.operator,
    threshold: input.threshold,
    title: input.title,
    description: input.description,
    priority: input.priority,
    isActive: input.isActive,
  });
  await invalidateCachedReportPdfs(db);

  return {
    id,
    categorySlug: input.categorySlug as AssessmentCategorySlug | null,
    operator: input.operator,
    threshold: input.threshold,
    title: input.title,
    description: input.description,
    priority: input.priority,
    isActive: input.isActive,
  };
}

export async function updateRecommendationRule(
  db: Database,
  id: string,
  input: RecommendationRuleInput,
): Promise<RecommendationRule> {
  const [existing] = await db.select().from(recommendationRules).where(eq(recommendationRules.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Recommendation rule not found" });
  }
  const categoryId = await resolveCategoryId(db, input.categorySlug);

  await db
    .update(recommendationRules)
    .set({
      categoryId,
      operator: input.operator,
      threshold: input.threshold,
      title: input.title,
      description: input.description,
      priority: input.priority,
      isActive: input.isActive,
    })
    .where(eq(recommendationRules.id, id));
  await invalidateCachedReportPdfs(db);

  return {
    id,
    categorySlug: input.categorySlug as AssessmentCategorySlug | null,
    operator: input.operator,
    threshold: input.threshold,
    title: input.title,
    description: input.description,
    priority: input.priority,
    isActive: input.isActive,
  };
}

export async function deleteRecommendationRule(db: Database, id: string): Promise<void> {
  const [existing] = await db.select().from(recommendationRules).where(eq(recommendationRules.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Recommendation rule not found" });
  }
  await db.delete(recommendationRules).where(eq(recommendationRules.id, id));
  await invalidateCachedReportPdfs(db);
}
