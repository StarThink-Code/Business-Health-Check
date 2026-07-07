import { createFileRoute, Link } from "@tanstack/react-router";
import { buttonClassName } from "@bhc/ui";
import { ASSESSMENT_CATEGORIES, CATEGORY_LABELS } from "@bhc/shared";
import { PublicHeader } from "../components/PublicHeader";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

const BENEFITS = [
  {
    title: "10 growth categories scored",
    description: "Website, SEO, marketing, sales, and more — measured on the same scale.",
  },
  {
    title: "A clear business health status",
    description: "Not just numbers — a plain-English read on where you stand today.",
  },
  {
    title: "Prioritized recommendations",
    description: "Know exactly which weak spots to fix first for the biggest impact.",
  },
  {
    title: "8-10 minutes, done",
    description: "A structured questionnaire, not a sales call in disguise.",
  },
];

function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main>
        <section className="page-shell max-w-4xl py-20 sm:py-28">
          <p className="eyebrow mb-4">Free digital growth assessment</p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            See exactly where your business stands — and what to fix next.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-secondary">
            A structured audit of your digital presence, marketing, and growth readiness,
            scored against real benchmarks — with a personalized report at the end.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/assessment/start" className={buttonClassName("primary", "lg")}>
              Start your free assessment
            </Link>
            <span className="text-sm text-ink-muted">No credit card · Takes ~8 minutes</span>
          </div>
        </section>

        <section className="border-y border-border bg-surface py-16">
          <div className="page-shell max-w-4xl">
            <h2 className="mb-8 text-sm font-semibold uppercase tracking-wider text-ink-muted">
              What you'll get
            </h2>
            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex gap-3.5">
                  <CheckIcon />
                  <div>
                    <p className="font-semibold text-ink">{benefit.title}</p>
                    <p className="mt-1 text-sm text-ink-secondary">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-shell max-w-4xl py-16">
          <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Everything we measure
          </h2>
          <div className="flex flex-wrap gap-2">
            {ASSESSMENT_CATEGORIES.map((slug) => (
              <span
                key={slug}
                className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink-secondary"
              >
                {CATEGORY_LABELS[slug]}
              </span>
            ))}
          </div>
        </section>

        <section className="page-shell max-w-4xl pb-24">
          <div className="rounded-2xl bg-accent px-8 py-12 text-center sm:px-16">
            <h2 className="text-2xl font-bold text-white">Ready to see your score?</h2>
            <p className="mx-auto mt-2 max-w-md text-accent-100">
              Get your personalized growth report in less time than it takes to make coffee.
            </p>
            <Link
              to="/assessment/start"
              className={buttonClassName("secondary", "lg", "mt-7 !bg-white !text-accent-700 hover:!bg-accent-50")}
            >
              Start your free assessment
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function CheckIcon() {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" aria-hidden>
        <path d="M3.5 8.5l3 3 6-7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
