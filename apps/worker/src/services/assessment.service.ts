import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import {
  assessmentAnswers,
  assessments,
  businesses,
  categories,
  recommendationRules,
  type Database,
} from "@bhc/database";
import {
  calculateCategoryScores,
  calculateOverallScore,
  evaluateRecommendations,
  resolveBusinessStatus,
  type AssessmentCategorySlug,
  type AssessmentReport,
  type RecommendationRule,
} from "@bhc/shared";
import type { BusinessInfoInput } from "@bhc/validation";
import { newId } from "../lib/ids";
import { loadQuestions } from "./questions.service";
import { loadBusinessStatusThresholds } from "./scoring-config.service";

export async function createAssessment(db: Database, business: BusinessInfoInput): Promise<string> {
  const businessId = newId("biz");
  await db.insert(businesses).values({
    id: businessId,
    name: business.businessName,
    industry: business.industry,
    website: business.website || null,
    country: business.country,
    teamSize: business.teamSize,
    businessAge: business.businessAge,
    marketingBudget: business.marketingBudget || null,
  });

  const assessmentId = newId("asmt");
  await db.insert(assessments).values({
    id: assessmentId,
    businessId,
    status: "in_progress",
  });

  return assessmentId;
}

export async function submitAssessment(
  db: Database,
  input: { assessmentId: string; answers: { questionId: string; optionId: string }[] },
): Promise<string> {
  const [assessment] = await db
    .select()
    .from(assessments)
    .where(eq(assessments.id, input.assessmentId))
    .limit(1);
  if (!assessment) {
    throw new HTTPException(404, { message: "Assessment not found" });
  }

  const questionList = await loadQuestions(db, { activeOnly: true });
  const questionById = new Map(questionList.map((q) => [q.id, q]));

  for (const answer of input.answers) {
    const question = questionById.get(answer.questionId);
    if (!question) {
      throw new HTTPException(400, { message: `Unknown question: ${answer.questionId}` });
    }
    if (!question.options.some((o) => o.id === answer.optionId)) {
      throw new HTTPException(400, {
        message: `Option ${answer.optionId} does not belong to question ${answer.questionId}`,
      });
    }
  }

  // Submission is idempotent: replace any prior answers for this assessment.
  await db.delete(assessmentAnswers).where(eq(assessmentAnswers.assessmentId, input.assessmentId));
  if (input.answers.length > 0) {
    await db.insert(assessmentAnswers).values(
      input.answers.map((a) => ({
        id: newId("ans"),
        assessmentId: input.assessmentId,
        questionId: a.questionId,
        optionId: a.optionId,
      })),
    );
  }

  const categoryScores = calculateCategoryScores(
    questionList,
    input.answers.map((a) => ({
      id: "",
      assessmentId: input.assessmentId,
      questionId: a.questionId,
      optionId: a.optionId,
    })),
  );
  const overallScore = calculateOverallScore(categoryScores);
  const thresholds = await loadBusinessStatusThresholds(db);
  const status = resolveBusinessStatus(overallScore, thresholds);

  await db
    .update(assessments)
    .set({
      status: "completed",
      overallScore,
      businessStatus: status.status,
      completedAt: new Date().toISOString(),
    })
    .where(eq(assessments.id, input.assessmentId));

  return input.assessmentId;
}

export async function getAssessmentReport(db: Database, assessmentId: string): Promise<AssessmentReport> {
  const [assessment] = await db.select().from(assessments).where(eq(assessments.id, assessmentId)).limit(1);
  if (!assessment || assessment.status !== "completed") {
    throw new HTTPException(404, { message: "Report not found" });
  }

  const [business] = await db.select().from(businesses).where(eq(businesses.id, assessment.businessId)).limit(1);
  if (!business) {
    throw new HTTPException(404, { message: "Business not found" });
  }

  const questionList = await loadQuestions(db, { activeOnly: true });
  const answerRows = await db
    .select()
    .from(assessmentAnswers)
    .where(eq(assessmentAnswers.assessmentId, assessmentId));

  const categoryScores = calculateCategoryScores(questionList, answerRows);
  const overallScore = assessment.overallScore ?? calculateOverallScore(categoryScores);

  const thresholds = await loadBusinessStatusThresholds(db);
  const status = resolveBusinessStatus(overallScore, thresholds);

  const categoryRows = await db.select().from(categories);
  const ruleRows = await db.select().from(recommendationRules).where(eq(recommendationRules.isActive, true));
  const rules: RecommendationRule[] = ruleRows.map((r) => ({
    id: r.id,
    categorySlug: (categoryRows.find((c) => c.id === r.categoryId)?.slug as AssessmentCategorySlug) ?? null,
    operator: r.operator as RecommendationRule["operator"],
    threshold: r.threshold,
    title: r.title,
    description: r.description,
    priority: r.priority,
    isActive: r.isActive,
  }));

  const recommendations = evaluateRecommendations(categoryScores, overallScore, rules);
  const sorted = [...categoryScores].sort((a, b) => b.percentage - a.percentage);

  return {
    assessment: {
      id: assessment.id,
      businessId: assessment.businessId,
      status: assessment.status as "completed",
      overallScore,
      businessStatus: status.status,
      startedAt: assessment.startedAt,
      completedAt: assessment.completedAt,
    },
    business: {
      id: business.id,
      name: business.name,
      industry: business.industry,
      website: business.website,
      country: business.country,
      teamSize: business.teamSize,
      businessAge: business.businessAge,
      marketingBudget: business.marketingBudget,
      createdAt: business.createdAt,
    },
    overallScore,
    businessStatus: status.status,
    businessStatusLabel: status.label,
    categoryScores: sorted,
    strengths: sorted.filter((c) => c.percentage >= 75).slice(0, 3),
    weaknesses: sorted.filter((c) => c.percentage < 60).slice(-3),
    recommendations,
  };
}
