import type { AssessmentCategorySlug } from "./categories";
import { CATEGORY_LABELS } from "./categories";
import type { AssessmentAnswer, CategoryScore, Question } from "./types";

/**
 * Pure, data-driven scoring: every question/option/score comes from the DB
 * (via the admin panel), so changing point values or adding categories never
 * requires a code change here.
 */
export function calculateCategoryScores(
  questions: Question[],
  answers: AssessmentAnswer[],
): CategoryScore[] {
  const answerByQuestionId = new Map(answers.map((a) => [a.questionId, a]));
  const questionsByCategory = new Map<AssessmentCategorySlug, Question[]>();

  for (const question of questions) {
    if (!question.isActive) continue;
    const bucket = questionsByCategory.get(question.categorySlug) ?? [];
    bucket.push(question);
    questionsByCategory.set(question.categorySlug, bucket);
  }

  const scores: CategoryScore[] = [];
  for (const [categorySlug, categoryQuestions] of questionsByCategory) {
    let pointsPossible = 0;
    let pointsEarned = 0;

    for (const question of categoryQuestions) {
      const maxScore = Math.max(0, ...question.options.map((o) => o.score));
      pointsPossible += maxScore;

      const answer = answerByQuestionId.get(question.id);
      const selectedOption = answer
        ? question.options.find((o) => o.id === answer.optionId)
        : undefined;
      pointsEarned += selectedOption?.score ?? 0;
    }

    scores.push({
      categorySlug,
      label: CATEGORY_LABELS[categorySlug] ?? categorySlug,
      pointsEarned,
      pointsPossible,
      percentage: pointsPossible > 0 ? roundScore((pointsEarned / pointsPossible) * 100) : 0,
    });
  }

  return scores;
}

/**
 * Overall score = total points earned across every category ÷ total points
 * possible, as a percentage — not an average of per-category percentages.
 * This matters whenever categories carry different point scales (e.g. a
 * 0-3 question next to several 0-2 questions): summing raw points naturally
 * gives the higher-scale category more influence, matching how a plain
 * "add up the points, divide by the max" scoring sheet works.
 */
export function calculateOverallScore(categoryScores: CategoryScore[]): number {
  const scored = categoryScores.filter((c) => c.pointsPossible > 0);
  if (scored.length === 0) return 0;
  const totalEarned = scored.reduce((sum, c) => sum + c.pointsEarned, 0);
  const totalPossible = scored.reduce((sum, c) => sum + c.pointsPossible, 0);
  return roundScore((totalEarned / totalPossible) * 100);
}

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}
