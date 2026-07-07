import { z } from "zod";

export const teamSizeOptions = ["1", "2-10", "11-50", "51-200", "200+"] as const;
export const businessAgeOptions = [
  "less_than_1_year",
  "1_3_years",
  "4_10_years",
  "10_plus_years",
] as const;

export const businessInfoSchema = z.object({
  businessName: z.string().trim().min(2).max(200),
  industry: z.string().trim().min(2).max(120),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL, e.g. https://example.com")
    .max(300)
    .optional()
    .or(z.literal("")),
  country: z.string().trim().min(2).max(100),
  teamSize: z.enum(teamSizeOptions),
  businessAge: z.enum(businessAgeOptions),
  marketingBudget: z.string().trim().max(120).optional(),
});

export type BusinessInfoInput = z.infer<typeof businessInfoSchema>;
