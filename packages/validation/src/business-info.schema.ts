import { z } from "zod";

export const businessInfoSchema = z.object({
  businessName: z.string().trim().min(2).max(200),
  email: z.string().trim().email("Enter a valid email address"),
  industry: z.string().trim().min(2).max(120),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL, e.g. https://example.com")
    .max(300)
    .optional()
    .or(z.literal("")),
  country: z.string().trim().min(2).max(100),
  marketingBudget: z.string().trim().max(120).optional(),
});

export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;
