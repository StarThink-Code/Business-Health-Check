import { eq } from "drizzle-orm";
import { assessmentAnswers, assessments, type Database } from "@bhc/database";
import {
  BUSINESS_STATUSES,
  calculateCategoryScores,
  type AdminAnalytics,
  type AnalyticsOverview,
  type BusinessStatus,
  type CategoryPerformance,
} from "@bhc/shared";
import { loadQuestions } from "./questions.service";

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

async function getOverview(db: Database): Promise<AnalyticsOverview> {
  const rows = await db.select().from(assessments);
  const total = rows.length;
  const completed = rows.filter((a) => a.status === "completed");
  const inProgress = rows.filter((a) => a.status === "in_progress").length;

  const averageScore =
    completed.length > 0
      ? round1(completed.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) / completed.length)
      : 0;

  const statusCounts = Object.fromEntries(BUSINESS_STATUSES.map((s) => [s, 0])) as Record<BusinessStatus, number>;
  for (const a of completed) {
    if (a.businessStatus && a.businessStatus in statusCounts) {
      statusCounts[a.businessStatus as BusinessStatus] += 1;
    }
  }

  return {
    totalAssessments: total,
    completedAssessments: completed.length,
    inProgressAssessments: inProgress,
    completionRate: total > 0 ? round1((completed.length / total) * 100) : 0,
    averageScore,
    statusCounts,
  };
}

async function getCategoryPerformance(db: Database): Promise<CategoryPerformance[]> {
  const [questionList, completedRows, answerRows] = await Promise.all([
    loadQuestions(db, { activeOnly: true }),
    db.select({ id: assessments.id }).from(assessments).where(eq(assessments.status, "completed")),
    db.select().from(assessmentAnswers),
  ]);

  const completedIds = new Set(completedRows.map((a) => a.id));
  const answersByAssessment = new Map<string, typeof answerRows>();
  for (const answer of answerRows) {
    if (!completedIds.has(answer.assessmentId)) continue;
    const bucket = answersByAssessment.get(answer.assessmentId) ?? [];
    bucket.push(answer);
    answersByAssessment.set(answer.assessmentId, bucket);
  }

  const totals = new Map<string, { label: string; total: number; count: number }>();
  for (const [, answersForAssessment] of answersByAssessment) {
    const categoryScores = calculateCategoryScores(questionList, answersForAssessment);
    for (const cs of categoryScores) {
      if (cs.pointsPossible === 0) continue; // category has no active questions right now
      const entry = totals.get(cs.categorySlug) ?? { label: cs.label, total: 0, count: 0 };
      entry.total += cs.percentage;
      entry.count += 1;
      totals.set(cs.categorySlug, entry);
    }
  }

  return [...totals.entries()]
    .map(([categorySlug, v]) => ({
      categorySlug: categorySlug as CategoryPerformance["categorySlug"],
      label: v.label,
      averageScore: round1(v.total / v.count),
      assessmentCount: v.count,
    }))
    .sort((a, b) => a.averageScore - b.averageScore);
}

export async function getAnalytics(db: Database): Promise<AdminAnalytics> {
  const [overview, categoryPerformance] = await Promise.all([getOverview(db), getCategoryPerformance(db)]);
  return { overview, categoryPerformance };
}
