import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, ProgressBar, RadioCard } from "@bhc/ui";
import type { GetQuestionsResponse, SubmitAssessmentResponse } from "@bhc/api";
import { apiClient } from "../lib/api-client";

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
    const byCategory = new Map<string, { label: string; questions: typeof data.questions }>();
    for (const question of data.questions) {
      const bucket = byCategory.get(question.categorySlug) ?? { label: question.categorySlug, questions: [] };
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
    <main className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-8">
        <ProgressBar value={(answeredCount / totalQuestions) * 100} label="Overall progress" />
      </div>

      <Card>
        <h2 className="mb-6 text-xl font-semibold capitalize text-slate-900 dark:text-slate-100">
          {currentCategory.label.replace(/_/g, " ")}
        </h2>

        <div className="space-y-8">
          {currentCategory.questions.map((question) => (
            <fieldset key={question.id}>
              <legend className="mb-3 font-medium text-slate-800 dark:text-slate-200">
                {question.prompt}
              </legend>
              {question.helpText && (
                <p className="mb-3 text-sm text-slate-500">{question.helpText}</p>
              )}
              <div className="space-y-2">
                {question.options.map((option) => (
                  <RadioCard
                    key={option.id}
                    name={question.id}
                    value={option.id}
                    label={option.label}
                    checked={answers[question.id] === option.id}
                    onChange={(optionId) =>
                      setAnswers((prev) => ({ ...prev, [question.id]: optionId }))
                    }
                  />
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
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
          <p className="mt-4 text-sm text-red-600">{(submitMutation.error as Error).message}</p>
        )}
      </Card>
    </main>
  );
}

function CenteredMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-slate-600 dark:text-slate-400">
      {children}
    </div>
  );
}
