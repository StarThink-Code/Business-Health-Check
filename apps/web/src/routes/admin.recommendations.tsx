import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@bhc/ui";
import type { RecommendationRule } from "@bhc/shared";
import {
  recommendationRuleInputSchema,
  scoreComparisonOperators,
  type RecommendationRuleInput,
} from "@bhc/validation";
import type { AdminListCategoriesResponse, AdminListRecommendationRulesResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient, ApiError } from "../lib/api-client";

export const Route = createFileRoute("/admin/recommendations")({
  component: AdminRecommendationsPage,
});

const OPERATOR_SYMBOLS: Record<(typeof scoreComparisonOperators)[number], string> = {
  lt: "<",
  lte: "≤",
  gt: ">",
  gte: "≥",
  eq: "=",
};

// Native <select> only carries strings — this sentinel represents "no category" (overall score).
const OVERALL_SCORE_VALUE = "__overall__";

function AdminRecommendationsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<RecommendationRule | "new" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "recommendations"],
    queryFn: () => apiClient.get<AdminListRecommendationRulesResponse>("/api/admin/recommendations"),
  });
  const { data: categoriesData } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiClient.get<AdminListCategoriesResponse>("/api/admin/categories"),
  });
  const categories = categoriesData?.categories ?? [];
  const categoryLabel = (slug: string | null) =>
    slug === null ? "Overall score" : (categories.find((c) => c.slug === slug)?.label ?? slug);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/recommendations/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "recommendations"] }),
  });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Recommendations</h1>
        <Button onClick={() => setEditing("new")}>Add rule</Button>
      </div>

      <p className="mb-6 text-sm text-ink-muted">
        Rules like "IF SEO score &lt; 40 THEN show this advice" — evaluated against every completed
        assessment and shown on the report and PDF, highest priority first.
      </p>

      {editing && (
        <div className="mb-8">
          <RecommendationForm
            rule={editing === "new" ? null : editing}
            categories={categories}
            onDone={() => setEditing(null)}
          />
        </div>
      )}

      {deleteMutation.isError && (
        <p className="mb-4 text-sm text-critical">{(deleteMutation.error as Error).message}</p>
      )}

      {isLoading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : data && data.rules.length === 0 ? (
        <p className="text-ink-muted">No rules yet — recommendations won't show on any report until you add one.</p>
      ) : (
        <div className="space-y-3">
          {data?.rules.map((r) => (
            <Card key={r.id} className="flex items-center justify-between !p-5">
              <div>
                <p className="eyebrow mb-1 flex items-center gap-2">
                  {categoryLabel(r.categorySlug)} {OPERATOR_SYMBOLS[r.operator]} {r.threshold} · Priority{" "}
                  {r.priority}
                  {!r.isActive && <span className="rounded-full bg-page px-2 py-0.5 text-ink-muted">Disabled</span>}
                </p>
                <p className="text-ink">{r.title}</p>
                <p className="text-sm text-ink-muted">{r.description}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setEditing(r)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Delete "${r.title}"?`)) deleteMutation.mutate(r.id);
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

function RecommendationForm({
  rule,
  categories,
  onDone,
}: {
  rule: RecommendationRule | null;
  categories: { slug: string; label: string }[];
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecommendationRuleInput>({
    resolver: zodResolver(recommendationRuleInputSchema),
    defaultValues: rule
      ? {
          categorySlug: rule.categorySlug,
          operator: rule.operator,
          threshold: rule.threshold,
          title: rule.title,
          description: rule.description,
          priority: rule.priority,
          isActive: rule.isActive,
        }
      : {
          categorySlug: null,
          operator: "lt",
          threshold: 40,
          title: "",
          description: "",
          priority: 0,
          isActive: true,
        },
  });

  const saveMutation = useMutation({
    mutationFn: (values: RecommendationRuleInput) =>
      rule
        ? apiClient.put(`/api/admin/recommendations/${rule.id}`, values)
        : apiClient.post("/api/admin/recommendations", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "recommendations"] });
      onDone();
    },
  });

  return (
    <Card>
      <form
        className="space-y-4"
        onSubmit={handleSubmit((values) => saveMutation.mutate(values))}
      >
        <div className="grid grid-cols-3 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Category</span>
            <select
              className="input"
              {...register("categorySlug", {
                setValueAs: (v) => (v === OVERALL_SCORE_VALUE ? null : v),
              })}
              defaultValue={rule?.categorySlug ?? OVERALL_SCORE_VALUE}
            >
              <option value={OVERALL_SCORE_VALUE}>Overall score</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Operator</span>
            <select className="input" {...register("operator")}>
              {scoreComparisonOperators.map((op) => (
                <option key={op} value={op}>
                  {OPERATOR_SYMBOLS[op]} ({op})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Threshold</span>
            <input className="input" type="number" {...register("threshold", { valueAsNumber: true })} />
            {errors.threshold && <span className="text-sm text-critical">{errors.threshold.message}</span>}
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Title</span>
          <input className="input" placeholder="e.g. Improve your SEO foundations" {...register("title")} />
          {errors.title && <span className="text-sm text-critical">{errors.title.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Description</span>
          <textarea
            className="input min-h-24"
            placeholder="What the user should do about it"
            {...register("description")}
          />
          {errors.description && <span className="text-sm text-critical">{errors.description.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Priority</span>
            <input className="input" type="number" {...register("priority", { valueAsNumber: true })} />
            <span className="mt-1 block text-xs text-ink-muted">Higher shows first when several rules match.</span>
          </label>
          <label className="flex items-end gap-2 pb-2.5">
            <input type="checkbox" className="h-4 w-4 accent-accent-text" {...register("isActive")} />
            <span className="text-sm font-medium text-ink">Active</span>
          </label>
        </div>

        {saveMutation.isError && (
          <p className="text-sm text-critical">
            {saveMutation.error instanceof ApiError
              ? saveMutation.error.message
              : "Something went wrong. Please try again."}
          </p>
        )}

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
