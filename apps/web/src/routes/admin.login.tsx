import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card } from "@bhc/ui";
import { adminLoginSchema, type AdminLoginInput } from "@bhc/validation";
import type { AdminLoginResponse } from "@bhc/api";
import { apiClient } from "../lib/api-client";
import { adminAuth } from "../lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  const loginMutation = useMutation({
    mutationFn: (values: AdminLoginInput) =>
      apiClient.post<AdminLoginResponse>("/api/admin/login", values),
    onSuccess: ({ token }) => {
      adminAuth.setToken(token);
      navigate({ to: "/admin" });
    },
  });

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold text-slate-900 dark:text-slate-100">Admin sign in</h1>
        <form className="space-y-4" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </span>
            <input className="input" type="email" {...register("email")} />
            {errors.email && <span className="mt-1 block text-sm text-red-600">{errors.email.message}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </span>
            <input className="input" type="password" {...register("password")} />
            {errors.password && (
              <span className="mt-1 block text-sm text-red-600">{errors.password.message}</span>
            )}
          </label>

          {loginMutation.isError && (
            <p className="text-sm text-red-600">{(loginMutation.error as Error).message}</p>
          )}

          <Button type="submit" disabled={loginMutation.isPending} className="w-full">
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
