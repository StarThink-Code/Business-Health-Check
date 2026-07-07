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
  const match = thresholds.find((t) => score >= t.minScore && score <= t.maxScore);
  if (match) return match;
  // Score outside all configured ranges (e.g. gaps in admin config) — clamp to nearest.
  const sorted = [...thresholds].sort((a, b) => a.minScore - b.minScore);
  return score < (sorted[0]?.minScore ?? 0) ? sorted[0]! : sorted[sorted.length - 1]!;
}
