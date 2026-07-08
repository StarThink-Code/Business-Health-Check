export const BUSINESS_STATUSES = [
  "excellent",
  "very_good",
  "good",
  "needs_improvement",
  "critical",
] as const;

export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export interface BusinessStatusThreshold {
  status: BusinessStatus;
  label: string;
  /** Inclusive lower bound, 0-100 */
  minScore: number;
  /** Inclusive upper bound, 0-100 */
  maxScore: number;
}

/**
 * Default thresholds, used to seed the `scoring_config` table and as a
 * fallback if the admin has not customized them. Admins can override ranges
 * via the admin panel; the worker always reads from the DB first.
 */
export const DEFAULT_BUSINESS_STATUS_THRESHOLDS: BusinessStatusThreshold[] = [
  { status: "excellent", label: "Excellent", minScore: 90, maxScore: 100 },
  { status: "very_good", label: "Very Good", minScore: 75, maxScore: 89 },
  { status: "good", label: "Good", minScore: 60, maxScore: 74 },
  { status: "needs_improvement", label: "Needs Improvement", minScore: 40, maxScore: 59 },
  { status: "critical", label: "Critical", minScore: 0, maxScore: 39 },
];

export function resolveBusinessStatus(
  score: number,
  thresholds: BusinessStatusThreshold[] = DEFAULT_BUSINESS_STATUS_THRESHOLDS,
): BusinessStatusThreshold {
  // Match by minScore only (highest band whose floor the score clears), not
  // an inclusive [min,max] range: real scores are floats (e.g. an average of
  // 59.1), but band boundaries are whole numbers, so an inclusive-range match
  // leaves a gap between e.g. 59 and 60 that matches no band at all.
  const sorted = [...thresholds].sort((a, b) => b.minScore - a.minScore);
  return sorted.find((t) => score >= t.minScore) ?? sorted[sorted.length - 1]!;
}
