import type { CategoryScore, RecommendationRule, ScoreComparisonOperator, TriggeredRecommendation } from "./types";

const COMPARATORS: Record<ScoreComparisonOperator, (value: number, threshold: number) => boolean> = {
  lt: (v, t) => v < t,
  lte: (v, t) => v <= t,
  gt: (v, t) => v > t,
  gte: (v, t) => v >= t,
  eq: (v, t) => v === t,
};

/**
 * Evaluates admin-configured rules (e.g. "IF SEO Score < 40 THEN show SEO guide")
 * against the computed scores. Rules with `categorySlug: null` compare against
 * the overall score. Returns rules sorted by priority (highest first).
 */
export function evaluateRecommendations(
  categoryScores: CategoryScore[],
  overallScore: number,
  rules: RecommendationRule[],
): TriggeredRecommendation[] {
  const scoreByCategory = new Map(categoryScores.map((c) => [c.categorySlug, c.percentage]));

  const triggered: TriggeredRecommendation[] = [];
  for (const rule of rules) {
    if (!rule.isActive) continue;
    const value = rule.categorySlug ? scoreByCategory.get(rule.categorySlug) : overallScore;
    if (value === undefined) continue;

    const compare = COMPARATORS[rule.operator];
    if (compare(value, rule.threshold)) {
      triggered.push({
        ruleId: rule.id,
        title: rule.title,
        description: rule.description,
        priority: rule.priority,
        categorySlug: rule.categorySlug,
      });
    }
  }

  return triggered.sort((a, b) => b.priority - a.priority);
}
