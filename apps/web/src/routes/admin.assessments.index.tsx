import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, STATUS_COLOR_TOKENS } from "@bhc/ui";
import type { BusinessStatus } from "@bhc/shared";
import type { AdminListAssessmentsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/assessments/")({
  component: AdminAssessmentsPage,
});

const PAGE_SIZE = 20;

function AdminAssessmentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "assessments", { page, pageSize: PAGE_SIZE }],
    queryFn: () =>
      apiClient.get<AdminListAssessmentsResponse>(`/api/admin/assessments?page=${page}&pageSize=${PAGE_SIZE}`),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-ink">Assessment History</h1>

      {isLoading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <Card className="overflow-x-auto !p-0">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-muted">
              <tr>
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Score</th>
                <th className="px-5 py-3 font-medium">Business status</th>
                <th className="px-5 py-3 font-medium">Started</th>
                <th className="px-5 py-3 font-medium">Completed</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="text-ink">
              {data?.assessments.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-5 py-3 font-mono text-xs text-ink-muted">{a.id}</td>
                  <td className="px-5 py-3 capitalize">{a.status.replace(/_/g, " ")}</td>
                  <td className="px-5 py-3 tabular-nums">{a.overallScore ?? "—"}</td>
                  <td className="px-5 py-3">
                    {a.businessStatus ? <StatusPill status={a.businessStatus} /> : "—"}
                  </td>
                  <td className="px-5 py-3 text-ink-secondary">{new Date(a.startedAt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-ink-secondary">
                    {a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to="/admin/assessments/$assessmentId"
                      params={{ assessmentId: a.id }}
                      className="font-medium text-accent-text hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4 flex items-center gap-4">
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-ink-muted">
          Page {page} of {totalPages}
        </span>
        <button
          className="text-sm font-medium text-ink-secondary hover:text-ink disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </AdminShell>
  );
}

function StatusPill({ status }: { status: BusinessStatus }) {
  const color = STATUS_COLOR_TOKENS[status];
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${color.text} ${color.tint}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
