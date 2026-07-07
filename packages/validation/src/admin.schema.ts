import { z } from "zod";
import { ASSESSMENT_CATEGORIES } from "@bhc/shared";

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const questionOptionInputSchema = z.object({
  id: z.string().optional(), // omitted when creating a new option
  label: z.string().trim().min(1).max(200),
  score: z.number().int().min(0).max(100),
  sortOrder: z.number().int().min(0),
});

export const questionInputSchema = z.object({
  categorySlug: z.enum(ASSESSMENT_CATEGORIES),
  prompt: z.string().trim().min(3).max(500),
  helpText: z.string().trim().max(1000).optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean().default(true),
  options: z.array(questionOptionInputSchema).min(2, "At least two options are required"),
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

export const scoreComparisonOperators = ["lt", "lte", "gt", "gte", "eq"] as const;

export const recommendationRuleInputSchema = z.object({
  categorySlug: z.enum(ASSESSMENT_CATEGORIES).nullable(),
  operator: z.enum(scoreComparisonOperators),
  threshold: z.number().min(0).max(100),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(3).max(2000),
  priority: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});
export type RecommendationRuleInput = z.infer<typeof recommendationRuleInputSchema>;

export const businessStatusThresholdInputSchema = z
  .array(
    z.object({
      status: z.string(),
      label: z.string(),
      minScore: z.number().min(0).max(100),
      maxScore: z.number().min(0).max(100),
    }),
  )
  .min(1);
