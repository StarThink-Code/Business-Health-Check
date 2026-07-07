import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@bhc/ui";
import { ASSESSMENT_CATEGORIES, CATEGORY_LABELS, type Question } from "@bhc/shared";
import { questionInputSchema, type QuestionInput } from "@bhc/validation";
import type { AdminListQuestionsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/questions")({
  component: AdminQuestionsPage,
});

function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Question | "new" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: () => apiClient.get<AdminListQuestionsResponse>("/api/admin/questions"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/questions/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "questions"] }),
  });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Questions</h1>
        <Button onClick={() => setEditing("new")}>Add question</Button>
      </div>

      {editing && (
        <div className="mb-8">
          <QuestionForm question={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        </div>
      )}

      {isLoading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {data?.questions.map((q) => (
            <Card key={q.id} className="flex items-center justify-between !p-5">
              <div>
                <p className="eyebrow mb-1 flex items-center gap-2">
                  {CATEGORY_LABELS[q.categorySlug]}
                  {!q.isActive && (
                    <span className="rounded-full bg-page px-2 py-0.5 text-ink-muted">Disabled</span>
                  )}
                </p>
                <p className="text-ink">{q.prompt}</p>
                <p className="text-sm text-ink-muted">{q.options.length} options</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setEditing(q)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this question?")) deleteMutation.mutate(q.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function QuestionForm({ question, onDone }: { question: Question | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuestionInput>({
    resolver: zodResolver(questionInputSchema),
    defaultValues: question
      ? {
          categorySlug: question.categorySlug,
          prompt: question.prompt,
          helpText: question.helpText ?? "",
          sortOrder: question.sortOrder,
          isActive: question.isActive,
          options: question.options.map((o) => ({ label: o.label, score: o.score, sortOrder: o.sortOrder })),
        }
      : {
          categorySlug: ASSESSMENT_CATEGORIES[0],
          prompt: "",
          sortOrder: 0,
          isActive: true,
          options: [
            { label: "", score: 10, sortOrder: 0 },
            { label: "", score: 0, sortOrder: 1 },
          ],
        },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "options" });

  const saveMutation = useMutation({
    mutationFn: (values: QuestionInput) =>
      question
        ? apiClient.put(`/api/admin/questions/${question.id}`, values)
        : apiClient.post("/api/admin/questions", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      onDone();
    },
  });

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Category</span>
          <select className="input" {...register("categorySlug")}>
            {ASSESSMENT_CATEGORIES.map((slug) => (
              <option key={slug} value={slug}>
                {CATEGORY_LABELS[slug]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Prompt</span>
          <input className="input" {...register("prompt")} />
          {errors.prompt && <span className="text-sm text-critical">{errors.prompt.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Help text (optional)</span>
          <input className="input" {...register("helpText")} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Sort order</span>
            <input className="input" type="number" {...register("sortOrder", { valueAsNumber: true })} />
          </label>
          <label className="flex items-end gap-2 pb-2.5">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register("isActive")} />
            <span className="text-sm font-medium text-ink">Active</span>
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink">Options</span>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Label"
                  {...register(`options.${index}.label` as const)}
                />
                <input
                  className="input w-24"
                  type="number"
                  placeholder="Score"
                  {...register(`options.${index}.score` as const, { valueAsNumber: true })}
                />
                <input
                  type="hidden"
                  value={index}
                  {...register(`options.${index}.sortOrder` as const, { valueAsNumber: true })}
                />
                <Button type="button" variant="ghost" onClick={() => remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          {errors.options && <p className="mt-1 text-sm text-critical">{errors.options.message}</p>}
          <Button
            type="button"
            variant="secondary"
            className="mt-2"
            onClick={() => append({ label: "", score: 0, sortOrder: fields.length })}
          >
            Add option
          </Button>
        </div>

        {saveMutation.isError && <p className="text-sm text-critical">{(saveMutation.error as Error).message}</p>}

        <div className="flex gap-2 border-t border-border pt-4">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="secondary" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
