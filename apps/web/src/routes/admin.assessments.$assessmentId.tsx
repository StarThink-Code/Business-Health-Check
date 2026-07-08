import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, StatusBadge } from "@bhc/ui";
import type { AdminGetAssessmentResponse } from "@bhc/api";
import { AdminShell } from "../components/AdminShell";
import { apiClient, apiUrl } from "../lib/api-client";

export const Route = createFileRoute("/admin/assessments/$assessmentId")({
  component: AdminAssessmentDetailPage,
});

function titleCaseStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w[0]!.toUpperCase() + w.slice(1))
    .join(" ");
}

const BUSINESS_AGE_LABELS: Record<string, string> = {
  less_than_1_year: "Less than 1 year",
  "1_3_years": "1–3 years",
  "4_10_years": "4–10 years",
  "10_plus_years": "10+ years",
};

function AdminAssessmentDetailPage() {
  const { assessmentId } = Route.useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "assessments", assessmentId],
    queryFn: () => apiClient.get<AdminGetAssessmentResponse>(`/api/admin/assessments/${assessmentId}`),
  });

  return (
    <AdminShell>
      <Link to="/admin/assessments" className="mb-4 inline-block text-sm text-ink-secondary hover:text-ink">
        ← Assessment History
      </Link>

      {isLoading && <p className="text-ink-muted">Loading…</p>}
      {isError && <p className="text-critical">Couldn't load this assessment.</p>}

      {data && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-ink">{data.business.name}</h1>
              <p className="mt-1 font-mono text-xs text-ink-muted">{data.assessment.id}</p>
            </div>
            <div className="flex items-center gap-3">
              {data.assessment.overallScore != null && (
                <span className="text-2xl font-bold tabular-nums text-ink">
                  {Math.round(data.assessment.overallScore)}
                </span>
              )}
              {data.assessment.businessStatus && (
                <StatusBadge
                  status={data.assessment.businessStatus}
                  label={titleCaseStatus(data.assessment.businessStatus)}
                />
              )}
            </div>
          </div>

          {data.assessment.status === "completed" && (
            <div className="flex gap-4 text-sm">
              <a
                href={`/report/${data.assessment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-text hover:underline"
              >
                View public report ↗
              </a>
              <a
                href={apiUrl(`/api/report/${data.assessment.id}/pdf`)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent-text hover:underline"
              >
                Download PDF ↗
              </a>
            </div>
          )}

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-ink">Submitted business information</h2>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
              <Field label="Business name" value={data.business.name} />
              <Field label="Industry" value={data.business.industry} />
              <Field label="Website" value={data.business.website ?? "—"} />
              <Field label="Country" value={data.business.country} />
              <Field label="Team size" value={data.business.teamSize} />
              <Field
                label="Business age"
                value={BUSINESS_AGE_LABELS[data.business.businessAge] ?? data.business.businessAge}
              />
              <Field label="Marketing budget" value={data.business.marketingBudget ?? "—"} />
              <Field label="Started" value={new Date(data.assessment.startedAt).toLocaleString()} />
              <Field
                label="Completed"
                value={data.assessment.completedAt ? new Date(data.assessment.completedAt).toLocaleString() : "—"}
              />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold text-ink">
              Submitted answers <span className="text-ink-muted">({data.answers.length})</span>
            </h2>
            {data.answers.length === 0 ? (
              <p className="text-sm text-ink-muted">No answers submitted yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {data.answers.map((a) => (
                  <div key={a.questionId} className="flex items-start justify-between gap-4 py-3">
                    <div>
                      <p className="eyebrow mb-0.5">{a.categoryLabel}</p>
                      <p className="text-sm text-ink">{a.prompt}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-ink">{a.optionLabel}</p>
                      <p className="text-xs text-ink-muted">{a.score} pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </AdminShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
