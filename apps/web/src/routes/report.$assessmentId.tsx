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
import { Card, ProgressBar, StatusBadge, StatTile, buttonClassName, STATUS_COLOR_TOKENS } from "@bhc/ui";
import { resolveBusinessStatus, CONTACT } from "@bhc/shared";
import type { GetReportResponse } from "@bhc/api";
import { apiClient, apiUrl } from "../lib/api-client";
import { BackToWebsiteLink } from "../components/BackToWebsiteLink";

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
  const whatsappMessage = encodeURIComponent(
    `Hello, I want to schedule an online meeting to discuss the marketing report for my business, ${data.business.name} (score: ${Math.round(data.overallScore)}, ${data.businessStatusLabel}).`,
  );
  const whatsappUrl = `https://wa.me/${CONTACT.whatsappNumber}?text=${whatsappMessage}`;

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
    <main className="page-shell max-w-3xl space-y-6 py-12 sm:py-16">
      <div className="flex justify-end">
        <BackToWebsiteLink className="text-ink-secondary hover:text-ink" />
      </div>
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
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName("primary", "lg", "mt-6")}
        >
          <WhatsAppIcon />
          Book a consultation on WhatsApp
        </a>
      </div>
    </main>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 0 0-5.6 9.78L1.5 14.5l3.32-.87A6.5 6.5 0 1 0 8 1.5Zm0 1.3a5.2 5.2 0 0 1 4.42 7.94l-.14.23.5 1.83-1.87-.49-.23.13A5.2 5.2 0 1 1 8 2.8Zm-2.6 2.4c-.14 0-.36.05-.55.27-.19.21-.72.7-.72 1.72 0 1.01.74 1.98.84 2.12.1.14 1.44 2.2 3.5 3 1.75.68 2.02.55 2.39.51.37-.04 1.19-.48 1.35-.95.17-.46.17-.86.12-.95-.05-.08-.19-.13-.4-.24-.2-.1-1.2-.59-1.38-.66-.19-.07-.32-.1-.46.1-.13.2-.52.65-.64.79-.12.13-.24.15-.44.05-.2-.1-.86-.32-1.63-1.01-.6-.54-1.01-1.2-1.13-1.4-.12-.2-.01-.31.09-.4.09-.1.2-.24.3-.36.1-.12.13-.2.2-.34.07-.14.03-.26-.02-.36-.05-.1-.46-1.13-.63-1.54-.16-.4-.33-.34-.46-.35Z" />
    </svg>
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
