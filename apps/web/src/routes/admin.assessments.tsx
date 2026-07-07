import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@bhc/ui";
import type { AdminListAssessmentsResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient } from "../lib/api-client";

export const Route = createFileRoute("/admin/assessments")({
  component: AdminAssessmentsPage,
});

const PAGE_SIZE = 20;

function AdminAssessmentsPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "assessments", { page, pageSize: PAGE_SIZE }],
    queryFn: () =>
      apiClient.get<AdminListAssessmentsResponse>(
        `/api/admin/assessments?page=${page}&pageSize=${PAGE_SIZE}`,
      ),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Assessment History</h1>

      {isLoading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="pb-2">ID</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Score</th>
                <th className="pb-2">Business Status</th>
                <th className="pb-2">Started</th>
                <th className="pb-2">Completed</th>
              </tr>
            </thead>
            <tbody className="text-slate-800 dark:text-slate-200">
              {data?.assessments.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2 font-mono text-xs">{a.id}</td>
                  <td className="py-2">{a.status}</td>
                  <td className="py-2">{a.overallScore ?? "—"}</td>
                  <td className="py-2">{a.businessStatus ?? "—"}</td>
                  <td className="py-2">{new Date(a.startedAt).toLocaleString()}</td>
                  <td className="py-2">{a.completedAt ? new Date(a.completedAt).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          className="text-sm text-slate-600 disabled:opacity-40"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <button
          className="text-sm text-slate-600 disabled:opacity-40"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </AdminShell>
  );
}
