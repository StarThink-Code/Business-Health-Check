import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@bhc/ui";
import type { AdminUser } from "@bhc/shared";
import {
  createAdminUserSchema,
  updateAdminUserSchema,
  type CreateAdminUserInput,
  type UpdateAdminUserInput,
} from "@bhc/validation";
import type { AdminListUsersResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient, ApiError } from "../lib/api-client";
import { adminAuth } from "../lib/admin-auth";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const currentAdminId = adminAuth.getCurrentAdminId();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiClient.get<AdminListUsersResponse>("/api/admin/users"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/admin/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Admin Users</h1>
        <Button onClick={() => setEditing("new")}>Add admin</Button>
      </div>

      {editing && (
        <div className="mb-8">
          {editing === "new" ? (
            <CreateAdminUserForm onDone={() => setEditing(null)} />
          ) : (
            <EditAdminUserForm user={editing} onDone={() => setEditing(null)} />
          )}
        </div>
      )}

      {deleteMutation.isError && (
        <p className="mb-4 text-sm text-critical">
          {deleteMutation.error instanceof ApiError ? deleteMutation.error.message : "Something went wrong."}
        </p>
      )}

      {isLoading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-3">
          {data?.users.map((u) => {
            const isSelf = u.id === currentAdminId;
            return (
              <Card key={u.id} className="flex items-center justify-between !p-5">
                <div>
                  <p className="eyebrow mb-1 flex items-center gap-2">
                    {u.email}
                    {isSelf && <span className="rounded-full bg-accent-tint px-2 py-0.5 text-accent-text">You</span>}
                  </p>
                  <p className="text-ink">{u.name}</p>
                  <p className="text-sm text-ink-muted">Created {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="secondary" onClick={() => setEditing(u)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isSelf}
                    title={isSelf ? "You can't delete your own account while signed in as it." : undefined}
                    onClick={() => {
                      if (confirm(`Delete "${u.name}" (${u.email})?`)) deleteMutation.mutate(u.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

function CreateAdminUserForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateAdminUserInput>({
    resolver: zodResolver(createAdminUserSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const saveMutation = useMutation({
    mutationFn: (values: CreateAdminUserInput) => apiClient.post("/api/admin/users", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onDone();
    },
  });

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
          <input className="input" {...register("name")} />
          {errors.name && <span className="text-sm text-critical">{errors.name.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input className="input" type="email" {...register("email")} />
          {errors.email && <span className="text-sm text-critical">{errors.email.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Password</span>
          <input className="input" type="password" {...register("password")} />
          {errors.password && <span className="text-sm text-critical">{errors.password.message}</span>}
        </label>

        {saveMutation.isError && (
          <p className="text-sm text-critical">
            {saveMutation.error instanceof ApiError ? saveMutation.error.message : "Something went wrong."}
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

function EditAdminUserForm({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAdminUserInput>({
    resolver: zodResolver(updateAdminUserSchema),
    defaultValues: { name: user.name, password: "" },
  });

  const saveMutation = useMutation({
    mutationFn: (values: UpdateAdminUserInput) =>
      apiClient.put(`/api/admin/users/${user.id}`, { ...values, password: values.password || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onDone();
    },
  });

  return (
    <Card>
      <form className="space-y-4" onSubmit={handleSubmit((values) => saveMutation.mutate(values))}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Email</span>
          <input className="input" value={user.email} disabled />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">Name</span>
          <input className="input" {...register("name")} />
          {errors.name && <span className="text-sm text-critical">{errors.name.message}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink">New password</span>
          <input className="input" type="password" placeholder="Leave blank to keep current password" {...register("password")} />
          {errors.password && <span className="text-sm text-critical">{errors.password.message}</span>}
        </label>

        {saveMutation.isError && (
          <p className="text-sm text-critical">
            {saveMutation.error instanceof ApiError ? saveMutation.error.message : "Something went wrong."}
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
