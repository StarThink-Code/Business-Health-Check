import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@bhc/ui";
import type { AdminCategory } from "@bhc/shared";
import { categoryInputSchema, type CategoryInput } from "@bhc/validation";
import type { AdminListCategoriesResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient, ApiError } from "../lib/api-client";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategoriesPage,
});

function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminCategory | "new" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => apiClient.get<AdminListCategoriesResponse>("/api/admin/categories"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  const categories = data ? [...data.categories].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Categories</h1>
        <Button onClick={() => setEditing("new")}>Add category</Button>
      </div>

      {editing && (
        <div className="mb-8">
          <CategoryForm category={editing === "new" ? null : editing} onDone={() => setEditing(null)} />
        </div>
      )}

      {deleteMutation.isError && (
        <p className="mb-4 text-sm text-critical">{(deleteMutation.error as Error).message}</p>
      )}

      {isLoading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between !p-5">
              <div>
                <p className="eyebrow mb-1 flex items-center gap-2">
                  {c.slug}
                  {!c.isActive && <span className="rounded-full bg-page px-2 py-0.5 text-ink-muted">Disabled</span>}
                </p>
                <p className="text-ink">{c.label}</p>
                <p className="text-sm text-ink-muted">
                  Sort order {c.sortOrder} · {c.questionCount} question{c.questionCount === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setEditing(c)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (confirm(`Delete "${c.label}"?`)) deleteMutation.mutate(c.id);
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

function CategoryForm({ category, onDone }: { category: AdminCategory | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: category
      ? {
          slug: category.slug,
          label: category.label,
          sortOrder: category.sortOrder,
          isActive: category.isActive,
        }
      : {
          slug: "",
          label: "",
          sortOrder: 0,
          isActive: true,
        },
  });

  const saveMutation = useMutation({
    mutationFn: (values: CategoryInput) =>
      category
        ? apiClient.put(`/api/admin/categories/${category.id}`, values)
        : apiClient.post("/api/admin/categories", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      onDone();
    },
  });

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Label</span>
          <input className="input" placeholder="e.g. Website" {...register("label")} />
          {errors.label && <span className="text-sm text-critical">{errors.label.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Slug</span>
          <input className="input font-mono" placeholder="e.g. website" {...register("slug")} />
          <span className="mt-1 block text-xs text-ink-muted">
            Lowercase letters, numbers, and underscores only. Used internally — changing it is safe, but avoid
            once questions are relying on it unless you mean to.
          </span>
          {errors.slug && <span className="text-sm text-critical">{errors.slug.message}</span>}
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink">Sort order</span>
            <input className="input" type="number" {...register("sortOrder", { valueAsNumber: true })} />
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
