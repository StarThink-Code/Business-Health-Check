import { desc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { assessmentAnswers, assessments, businesses, categories, questions, questionOptions, type Database } from "@bhc/database";
import type { AdminAssessmentDetail, AssessmentCategorySlug, Assessment } from "@bhc/shared";

export async function listAssessments(
  db: Database,
  pagination: { page: number; pageSize: number },
): Promise<{ assessments: Assessment[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;

  const rows = await db
    .select()
    .from(assessments)
    .orderBy(desc(assessments.startedAt))
    .limit(pagination.pageSize)
    .offset(offset);

  const countRows = await db.select({ count: sql<number>`count(*)` }).from(assessments);
  const count = countRows[0]?.count ?? 0;

  return {
    assessments: rows.map((r) => ({
      id: r.id,
      businessId: r.businessId,
      status: r.status as Assessment["status"],
      overallScore: r.overallScore,
      businessStatus: r.businessStatus as Assessment["businessStatus"],
      startedAt: r.startedAt,
      completedAt: r.completedAt,
    })),
    total: count,
  };
}

export async function getAssessmentDetail(db: Database, assessmentId: string): Promise<AdminAssessmentDetail> {
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  if (!assessment) {
    throw new HTTPException(404, { message: "Assessment not found" });
  }

  const [business] = await db.select().from(businesses).where(eq(businesses.id, assessment.businessId)).limit(1);
  if (!business) {
    throw new HTTPException(404, { message: "Business not found" });
  }

  const answerRows = await db
    .select({
      questionId: questions.id,
      categorySlug: categories.slug,
      categoryLabel: categories.label,
      prompt: questions.prompt,
      optionId: questionOptions.id,
      optionLabel: questionOptions.label,
      score: questionOptions.score,
    })
    .from(assessmentAnswers)
    .innerJoin(questions, eq(assessmentAnswers.questionId, questions.id))
    .innerJoin(categories, eq(questions.categoryId, categories.id))
    .innerJoin(questionOptions, eq(assessmentAnswers.optionId, questionOptions.id))
    .where(eq(assessmentAnswers.assessmentId, assessmentId));

  return {
    assessment: {
      id: assessment.id,
      businessId: assessment.businessId,
      status: assessment.status as Assessment["status"],
      overallScore: assessment.overallScore,
      businessStatus: assessment.businessStatus as Assessment["businessStatus"],
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
    },
    business: {
      id: business.id,
      name: business.name,
      email: business.email,
      industry: business.industry,
      website: business.website,
      country: business.country,
      marketingBudget: business.marketingBudget,
      createdAt: business.createdAt,
    },
    answers: answerRows.map((a) => ({
      ...a,
      categorySlug: a.categorySlug as AssessmentCategorySlug,
    })),
  };
}
