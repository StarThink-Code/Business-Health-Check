export const BUSINESS_STATUSES = [
  "strong_performer",
  "on_the_right_track",
  "just_getting_started",
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
 * Currently the client's 3-tier "Social Media Health Check" result bands.
 */
export const DEFAULT_BUSINESS_STATUS_THRESHOLDS: BusinessStatusThreshold[] = [
  { status: "strong_performer", label: "Strong Performer", minScore: 71, maxScore: 100 },
  { status: "on_the_right_track", label: "On The Right Track", minScore: 41, maxScore: 70 },
  { status: "just_getting_started", label: "Just Getting Started", minScore: 0, maxScore: 40 },
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
