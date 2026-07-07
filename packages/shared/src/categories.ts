/**
 * Canonical list of assessment categories.
 * Stored as `slug` values in the database so the set can grow via admin config
 * without a schema migration; this const is the fallback/default seed list.
 */
export const ASSESSMENT_CATEGORIES = [
  "website",
  "branding",
  "seo",
  "marketing",
  "social_media",
  "lead_generation",
  "sales",
  "customer_experience",
  "analytics",
  "automation",
] as const;

export type AssessmentCategorySlug = (typeof ASSESSMENT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AssessmentCategorySlug, string> = {
  website: "Website",
  branding: "Branding",
  seo: "SEO",
  marketing: "Marketing",
  social_media: "Social Media",
  lead_generation: "Lead Generation",
  sales: "Sales",
  customer_experience: "Customer Experience",
  analytics: "Analytics",
  automation: "Automation",
};
