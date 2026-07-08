import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, ProgressBar, STATUS_COLOR_TOKENS } from "@bhc/ui";
import { BUSINESS_STATUSES, DEFAULT_BUSINESS_STATUS_THRESHOLDS, type BusinessStatus } from "@bhc/shared";
import type { AdminAnalyticsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalyticsPage,
});

const STATUS_LABELS: Record<BusinessStatus, string> = Object.fromEntries(
  DEFAULT_BUSINESS_STATUS_THRESHOLDS.map((t) => [t.status, t.label]),
) as Record<BusinessStatus, string>;

function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => apiClient.get<AdminAnalyticsResponse>("/api/admin/analytics"),
  });

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-ink">Analytics</h1>

      {isLoading || !data ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4">
            <StatCard label="Total assessments" value={data.overview.totalAssessments} />
            <StatCard label="Completed" value={data.overview.completedAssessments} />
            <StatCard label="Completion rate" value={`${data.overview.completionRate}%`} />
            <StatCard label="Average score" value={data.overview.completedAssessments > 0 ? data.overview.averageScore : "—"} />
          </div>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-ink">Business health distribution</h2>
            {data.overview.completedAssessments === 0 ? (
              <p className="text-sm text-ink-muted">No completed assessments yet.</p>
            ) : (
              <div className="space-y-4">
                {BUSINESS_STATUSES.map((status) => {
                  const count = data.overview.statusCounts[status];
                  const pct = (count / data.overview.completedAssessments) * 100;
                  const color = STATUS_COLOR_TOKENS[status];
                  return (
                    <div key={status}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-ink-secondary">{STATUS_LABELS[status]}</span>
                        <span className="font-semibold text-ink">{count}</span>
                      </div>
                      <div className={`h-2 w-full overflow-hidden rounded-full ${color.tint}`}>
                        <div className={`h-full rounded-full ${color.fill}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-1 text-lg font-semibold text-ink">Category performance</h2>
            <p className="mb-4 text-sm text-ink-muted">
              Average score per category across all completed assessments — weakest first.
            </p>
            {data.categoryPerformance.length === 0 ? (
              <p className="text-sm text-ink-muted">No completed assessments yet.</p>
            ) : (
              <div className="space-y-4">
                {data.categoryPerformance.map((cp) => (
                  <ProgressBar
                    key={cp.categorySlug}
                    label={`${cp.label} (${cp.assessmentCount} assessment${cp.assessmentCount === 1 ? "" : "s"})`}
                    value={cp.averageScore}
                    variant="severity"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <Card className="w-56">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold text-ink">{value ?? "—"}</p>
    </Card>
  );
}
