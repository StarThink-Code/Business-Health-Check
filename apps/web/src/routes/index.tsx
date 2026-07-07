import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, buttonClassName } from "@bhc/ui";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const BENEFITS = [
  "See how your business scores across 10 growth categories",
  "Get a clear business health status, not just raw numbers",
  "Walk away with prioritized, actionable recommendations",
  "Takes about 8-10 minutes to complete",
];

function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Digital Business Growth Audit
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          A free, structured assessment of your digital presence, marketing, and growth
          readiness — with a personalized report at the end.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          What you'll get
        </h2>
        <ul className="space-y-2">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
              <span aria-hidden className="mt-1 text-indigo-600">
                •
              </span>
              {benefit}
            </li>
          ))}
        </ul>
      </Card>

      <div>
        <Link to="/assessment/start" className={buttonClassName("primary", "w-full sm:w-auto")}>
          Start your assessment
        </Link>
      </div>
    </main>
  );
}
