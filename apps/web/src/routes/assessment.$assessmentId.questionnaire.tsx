import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, ProgressBar, RadioCard } from "@bhc/ui";
import { CATEGORY_LABELS, type AssessmentCategorySlug } from "@bhc/shared";
import type { GetQuestionsResponse, SubmitAssessmentResponse } from "@bhc/api";
import { apiClient } from "../lib/api-client";
import { BackToWebsiteLink } from "../components/BackToWebsiteLink";

export const Route = createFileRoute("/assessment/$assessmentId/questionnaire")({
  component: QuestionnairePage,
});

function QuestionnairePage() {
  const { assessmentId } = Route.useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIndex, setStepIndex] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["questions"],
    queryFn: () => apiClient.get<GetQuestionsResponse>("/api/questions"),
  });

  const categories = useMemo(() => {
    if (!data) return [];
    const byCategory = new Map<AssessmentCategorySlug, { label: string; questions: typeof data.questions }>();
    for (const question of data.questions) {
      const bucket = byCategory.get(question.categorySlug) ?? {
        label: CATEGORY_LABELS[question.categorySlug] ?? question.categorySlug,
        questions: [],
      };
      bucket.questions.push(question);
      byCategory.set(question.categorySlug, bucket);
    }
    return [...byCategory.entries()].map(([slug, v]) => ({ slug, ...v }));
  }, [data]);

  const submitMutation = useMutation({
    mutationFn: () =>
      apiClient.post<SubmitAssessmentResponse>("/api/assessment/submit", {
        assessmentId,
        answers: Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId })),
      }),
    onSuccess: ({ reportId }) => {
      navigate({ to: "/report/$assessmentId", params: { assessmentId: reportId } });
    },
  });

  if (isLoading) return <CenteredMessage>Loading questionnaire…</CenteredMessage>;
  if (isError || categories.length === 0) {
    return <CenteredMessage>Couldn't load the questionnaire. Please refresh.</CenteredMessage>;
  }

  const totalQuestions = data!.questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentCategory = categories[stepIndex]!;
  const isLastStep = stepIndex === categories.length - 1;
  const currentCategoryAnswered = currentCategory.questions.every((q) => answers[q.id]);

  return (
    <main className="page-shell py-14 sm:py-20">
      <div className="mb-6 flex justify-end">
        <BackToWebsiteLink className="text-ink-secondary hover:text-ink" />
      </div>
      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-ink">
            Category {stepIndex + 1} of {categories.length}
          </span>
          <span className="text-ink-muted">
            {answeredCount} of {totalQuestions} answered
          </span>
        </div>
        <ProgressBar value={(answeredCount / totalQuestions) * 100} />
      </div>

      <Card>
        <p className="eyebrow mb-1">{currentCategory.label}</p>
        <h2 className="mb-6 text-xl font-semibold text-ink">
          Tell us about your {currentCategory.label.toLowerCase()}
        </h2>

        <div className="space-y-8">
          {currentCategory.questions.map((question) => (
            <fieldset key={question.id}>
              <legend className="mb-3 font-medium text-ink">{question.prompt}</legend>
              {question.helpText && <p className="mb-3 text-sm text-ink-muted">{question.helpText}</p>}
              <div className="space-y-2">
                {question.options.map((option) => (
                  <RadioCard
                    key={option.id}
                    name={question.id}
                    value={option.id}
                    label={option.label}
                    checked={answers[question.id] === option.id}
                    onChange={(optionId) => setAnswers((prev) => ({ ...prev, [question.id]: optionId }))}
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 flex justify-between border-t border-border pt-6">
          <Button
            type="button"
            variant="secondary"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Previous
          </Button>

          {isLastStep ? (
            <Button
              type="button"
              disabled={!currentCategoryAnswered || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? "Submitting…" : "See my results"}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!currentCategoryAnswered}
              onClick={() => setStepIndex((i) => Math.min(categories.length - 1, i + 1))}
            >
              Next
            </Button>
          )}
        </div>

        {submitMutation.isError && (
          <p className="mt-4 text-sm text-critical">{(submitMutation.error as Error).message}</p>
        )}
      </Card>
    </main>
  );
}

function CenteredMessage({ children }: { children: string }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-ink-secondary">{children}</div>;
}
