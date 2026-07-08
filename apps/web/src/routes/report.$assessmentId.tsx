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
import { Card, ProgressBar, StatusBadge, StatTile, Button, buttonClassName, STATUS_COLOR_TOKENS } from "@bhc/ui";
import { resolveBusinessStatus } from "@bhc/shared";
import type { GetReportResponse } from "@bhc/api";
import { apiClient, apiUrl } from "../lib/api-client";
import { PublicHeader } from "../components/PublicHeader";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export const Route = createFileRoute("/report/$assessmentId")({
  component: ReportPage,
});

// Muted ink token — identical hex in light and dark mode, so it's safe to
// hardcode for canvas rendering (Chart.js can't read CSS custom properties).
const MUTED = "#898781";

function ReportPage() {
  const { assessmentId } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["report", assessmentId],
    queryFn: () => apiClient.get<GetReportResponse>(`/api/report/${assessmentId}`),
  });

  if (isLoading) return <CenteredMessage>Building your report…</CenteredMessage>;
  if (isError || !data) return <CenteredMessage>Report not found.</CenteredMessage>;

  const statusColor = STATUS_COLOR_TOKENS[data.businessStatus];

  const radarData = {
    labels: data.categoryScores.map((c) => c.label),
    datasets: [
      {
        label: "Score",
        data: data.categoryScores.map((c) => c.percentage),
        backgroundColor: "rgba(90, 245, 3, 0.15)",
        borderColor: "#37840b",
        borderWidth: 2,
        pointBackgroundColor: "#37840b",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  return (
    <>
      <PublicHeader />
      <main className="page-shell max-w-3xl space-y-6 py-12 sm:py-16">
        <Card className="flex flex-col items-center">
          <p className="eyebrow">{data.business.name}</p>
          <StatTile label="Business health score" value={Math.round(data.overallScore)} valueClassName={statusColor.text} />
          <div className="mt-3">
            <StatusBadge status={data.businessStatus} label={data.businessStatusLabel} />
          </div>
          <a
            href={apiUrl(`/api/report/${assessmentId}/pdf`)}
            className={buttonClassName("secondary", "md", "mt-5")}
          >
            Download PDF
          </a>
        </Card>

        <Card>
          <h2 className="mb-6 text-lg font-semibold text-ink">Category scores</h2>
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="mx-auto h-80 w-full max-w-sm">
              <Radar
                data={radarData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    r: {
                      min: 0,
                      max: 100,
                      ticks: { display: false, stepSize: 25 },
                      grid: { color: "rgba(137,135,129,0.25)" },
                      angleLines: { color: "rgba(137,135,129,0.25)" },
                      pointLabels: { color: MUTED, font: { size: 11 } },
                    },
                  },
                }}
              />
            </div>
            <div className="space-y-4">
              {data.categoryScores.map((c) => (
                <ProgressBar key={c.categorySlug} label={c.label} value={c.percentage} variant="severity" />
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          {data.strengths.length > 0 && (
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-ink">Strengths</h2>
              <ul className="space-y-3">
                {data.strengths.map((s) => (
                  <ScoreRow key={s.categorySlug} label={s.label} percentage={s.percentage} />
                ))}
              </ul>
            </Card>
          )}

          {data.weaknesses.length > 0 && (
            <Card>
              <h2 className="mb-4 text-lg font-semibold text-ink">Improvement priorities</h2>
              <ul className="space-y-3">
                {data.weaknesses.map((w) => (
                  <ScoreRow key={w.categorySlug} label={w.label} percentage={w.percentage} />
                ))}
              </ul>
            </Card>
          )}
        </div>

        {data.recommendations.length > 0 && (
          <Card>
            <h2 className="mb-5 text-lg font-semibold text-ink">Recommendations</h2>
            <div className="space-y-5">
              {data.recommendations.map((r, i) => (
                <div key={r.ruleId} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-xs font-semibold text-accent-text">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-ink">{r.title}</p>
                    <p className="mt-0.5 text-sm text-ink-secondary">{r.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="rounded-2xl bg-accent-panel px-8 py-10 text-center">
          <h2 className="text-xl font-bold text-white">Want help acting on this?</h2>
          <p className="mx-auto mt-2 max-w-sm text-white/80">
            Book a free consultation and we'll walk through your results together.
          </p>
          <Button size="lg" className="mt-6">
            Book a consultation
          </Button>
        </div>
      </main>
    </>
  );
}

function ScoreRow({ label, percentage }: { label: string; percentage: number }) {
  const color = STATUS_COLOR_TOKENS[resolveBusinessStatus(percentage).status];
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink">{label}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.text} ${color.tint}`}>
        {Math.round(percentage)}%
      </span>
    </li>
  );
}

function CenteredMessage({ children }: { children: string }) {
  return <div className="flex min-h-screen items-center justify-center px-6 text-ink-secondary">{children}</div>;
}
