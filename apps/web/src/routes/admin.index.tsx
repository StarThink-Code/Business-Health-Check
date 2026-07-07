import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@bhc/ui";
import type { AdminListAssessmentsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data } = useQuery({
    queryKey: ["admin", "assessments", { page: 1, pageSize: 1 }],
    queryFn: () => apiClient.get<AdminListAssessmentsResponse>("/api/admin/assessments?page=1&pageSize=1"),
  });

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
      <Card className="max-w-xs">
        <p className="text-sm text-slate-500">Total assessments</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{data?.total ?? "—"}</p>
      </Card>
    </AdminShell>
  );
}
