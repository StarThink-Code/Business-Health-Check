import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import { Card, ProgressBar, StatusBadge, Button } from "@bhc/ui";
import type { GetReportResponse } from "@bhc/api";
import { apiClient } from "../lib/api-client";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const Route = createFileRoute("/report/$assessmentId")({
  component: ReportPage,
});

function ReportPage() {
  const { assessmentId } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["report", assessmentId],
    queryFn: () => apiClient.get<GetReportResponse>(`/api/report/${assessmentId}`),
  });

  if (isLoading) return <CenteredMessage>Building your report…</CenteredMessage>;
  if (isError || !data) return <CenteredMessage>Report not found.</CenteredMessage>;

  const radarData = {
    labels: data.categoryScores.map((c) => c.label),
    datasets: [
      {
        label: "Score",
        data: data.categoryScores.map((c) => c.percentage),
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        borderColor: "rgb(79, 70, 229)",
        pointBackgroundColor: "rgb(79, 70, 229)",
      },
    ],
  };

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-6 py-16">
      <Card className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {data.business.name}'s Business Health
        </p>
        <p className="text-6xl font-bold text-slate-900 dark:text-slate-100">
          {Math.round(data.overallScore)}
        </p>
        <StatusBadge status={data.businessStatus} label={data.businessStatusLabel} />
      </Card>

      <Card>
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-slate-100">
          Category Scores
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="max-w-sm">
            <Radar data={radarData} options={{ scales: { r: { min: 0, max: 100 } } }} />
          </div>
          <div className="space-y-4">
            {data.categoryScores.map((c) => (
              <ProgressBar key={c.categorySlug} label={c.label} value={c.percentage} />
            ))}
          </div>
        </div>
      </Card>

      {data.strengths.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Strengths</h2>
          <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
            {data.strengths.map((s) => (
              <li key={s.categorySlug}>
                {s.label} — {Math.round(s.percentage)}%
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.weaknesses.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Improvement Priorities
          </h2>
          <ul className="list-inside list-disc space-y-1 text-slate-700 dark:text-slate-300">
            {data.weaknesses.map((w) => (
              <li key={w.categorySlug}>
                {w.label} — {Math.round(w.percentage)}%
              </li>
            ))}
          </ul>
        </Card>
      )}

      {data.recommendations.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recommendations
          </h2>
          <div className="space-y-4">
            {data.recommendations.map((r) => (
              <div key={r.ruleId} className="border-l-2 border-indigo-600 pl-4">
                <p className="font-medium text-slate-900 dark:text-slate-100">{r.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{r.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Want help acting on this?
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Book a free consultation and we'll walk through your results together.
        </p>
        <Button>Book a consultation</Button>
      </Card>
    </main>
  );
}

function CenteredMessage({ children }: { children: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-slate-600 dark:text-slate-400">
      {children}
    </div>
  );
}
