import type { ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { Button, Card } from "@bhc/ui";
import { businessInfoSchema } from "@bhc/validation";
import { z } from "zod";
import { apiClient } from "../lib/api-client";
import type { StartAssessmentResponse } from "@bhc/api";
import bgAbout from "../assets/bg-about.jpg";

export const Route = createFileRoute("/assessment/start")({
  component: BusinessInfoPage,
});

const formSchema = businessInfoSchema.extend({
  turnstileToken: z.string().min(1, "Please complete the verification"),
});
type FormValues = z.infer<typeof formSchema>;

// StarThink's main site — a separate deployment. Update if it moves to a real domain.
const MAIN_SITE_URL = "https://website-code-bik.pages.dev";

function BusinessInfoPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const startMutation = useMutation({
    mutationFn: (values: FormValues) =>
      apiClient.post<StartAssessmentResponse>("/api/assessment/start", {
        business: {
          businessName: values.businessName,
          email: values.email,
          industry: values.industry,
          website: values.website,
          country: values.country,
          marketingBudget: values.marketingBudget,
        },
        turnstileToken: values.turnstileToken,
      }),
    onSuccess: ({ assessmentId }) => {
      navigate({ to: "/assessment/$assessmentId/questionnaire", params: { assessmentId } });
    },
  });

  return (
    <main
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgAbout})` }}
    >
      <div className="page-shell py-14 sm:py-20">
        <div className="mb-6 flex justify-end">
          <a
            href={MAIN_SITE_URL}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <BackArrowIcon />
            Back to Website
          </a>
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">Step 1 of 2</p>
        <h1 className="mb-2 text-2xl font-bold text-white sm:text-3xl">Tell us about your business</h1>
        <p className="mb-8 text-white/80">This helps us tailor your report. It takes less than a minute.</p>

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit((values) => startMutation.mutate(values))}>
            <Field label="Name" error={errors.businessName?.message}>
              <input className="input" {...register("businessName")} />
            </Field>

            <Field label="Email ID" error={errors.email?.message}>
              <input className="input" type="email" {...register("email")} placeholder="you@example.com" />
            </Field>

            <Field label="Industry" error={errors.industry?.message}>
              <input className="input" {...register("industry")} placeholder="e.g. E-commerce, Healthcare" />
            </Field>

            <Field label="Website (optional)" error={errors.website?.message}>
              <input className="input" {...register("website")} placeholder="https://example.com" />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Location" error={errors.country?.message}>
                <input className="input" {...register("country")} />
              </Field>

              <Field label="Monthly marketing budget (optional)" error={errors.marketingBudget?.message}>
                <input className="input" {...register("marketingBudget")} placeholder="e.g. RM1,000–RM5,000" />
              </Field>
            </div>

            {import.meta.env.VITE_TURNSTILE_SITE_KEY && (
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => setValue("turnstileToken", token, { shouldValidate: true })}
              />
            )}
            {errors.turnstileToken && <p className="text-sm text-critical">{errors.turnstileToken.message}</p>}

            {startMutation.isError && (
              <p className="text-sm text-critical">{(startMutation.error as Error).message}</p>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting || startMutation.isPending} className="w-full">
              {startMutation.isPending ? "Starting…" : "Continue to questionnaire"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}

function BackArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" aria-hidden>
      <path d="M9.5 3.5L4 8l5.5 4.5M4.5 8h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-critical">{error}</span>}
    </label>
  );
}
