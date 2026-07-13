/**
 * Canonical list of assessment categories.
 * Stored as `slug` values in the database so the set can grow via admin config
 * without a schema migration; this const is the fallback/default seed list —
 * currently the 7-question "Social Media Health Check" provided by the client.
 */
export const ASSESSMENT_CATEGORIES = [
  "social_media_presence",
  "content",
  "engagement",
  "paid_ads",
  "website",
  "lead_generation",
  "overall_impact",
] as const;

export type AssessmentCategorySlug = (typeof ASSESSMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AssessmentCategorySlug, string> = {
  social_media_presence: "Social Media Presence",
  content: "Content",
  engagement: "Engagement",
  paid_ads: "Paid Ads",
  website: "Website",
  lead_generation: "Lead Generation",
  overall_impact: "Overall Impact",
};
