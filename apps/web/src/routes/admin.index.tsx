import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@bhc/ui";
import type { AdminListAssessmentsResponse, AdminListQuestionsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const { data: assessments } = useQuery({
    queryKey: ["admin", "assessments", { page: 1, pageSize: 1 }],
    queryFn: () => apiClient.get<AdminListAssessmentsResponse>("/api/admin/assessments?page=1&pageSize=1"),
  });
  const { data: questions } = useQuery({
    queryKey: ["admin", "questions"],
    queryFn: () => apiClient.get<AdminListQuestionsResponse>("/api/admin/questions"),
  });

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-ink">Dashboard</h1>
      <div className="flex flex-wrap gap-4">
        <StatCard label="Total assessments" value={assessments?.total} />
        <StatCard label="Active questions" value={questions?.questions.filter((q) => q.isActive).length} />
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <Card className="w-56">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{value ?? "—"}</p>
    </Card>
  );
}
