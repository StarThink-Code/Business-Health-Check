import { z } from "zod";
import { businessInfoSchema } from "./business-info.schema";

export const startAssessmentSchema = z.object({
  business: businessInfoSchema,
  /** Cloudflare Turnstile token, verified server-side before creating the assessment */
  turnstileToken: z.string().min(1, "Verification token is required"),
});

export type StartAssessmentInput = z.infer<typeof startAssessmentSchema>;

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export const submitAssessmentSchema = z.object({
  assessmentId: z.string().min(1),
  answers: z.array(submitAnswerSchema).min(1, "At least one answer is required"),
});

export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
