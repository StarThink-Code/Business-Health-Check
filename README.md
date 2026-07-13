# Digital Business Growth Audit Platform

An interactive assessment tool that scores a business's digital presence, marketing, and
growth readiness across 10 categories, then generates a scored report (web + downloadable
PDF) with strengths, weaknesses, and admin-configurable recommendations. Built as a lead-gen
tool for StarThink.

**Live**
- Site: https://bhc-web.starthinkmy.workers.dev
- API: https://bhc-worker.starthinkmy.workers.dev

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, TanStack Router (file-based), TanStack Query, React Hook Form, Chart.js |
| Backend | Cloudflare Workers, [Hono](https://hono.dev), TypeScript |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| File storage | Cloudflare R2 (generated PDF reports) |
| Cache / rate limiting | Cloudflare KV |
| Bot protection | Cloudflare Turnstile |
| Auth | JWT (admin only), PBKDF2 password hashing (Web Crypto, no native deps) |
| PDF generation | [pdf-lib](https://pdf-lib.js.org) |

## Project structure

```
apps/
  web/       React SPA — public assessment flow + admin panel
  worker/    Cloudflare Worker — REST API, scoring, PDF generation

packages/
  shared/    Domain types, scoring engine, recommendation engine, contact info
  database/  Drizzle schema + migrations
  validation/  Zod schemas shared by frontend forms and backend request validation
  api/       REST route paths + request/response contract types
  ui/        Shared design-system React components (Button, Card, ProgressBar, …)

docs/        Setup and operational docs (see docs/cloudflare-setup.md)
scripts/     One-off admin/seed scripts (create-admin.mjs, seed SQL)
```

This is an npm workspaces monorepo. Every package under `apps/*` and `packages/*` is
referenced by name (`@bhc/web`, `@bhc/worker`, `@bhc/shared`, etc.) — packages resolve to
their TypeScript source directly (no build step needed between them in dev).

## Getting started

```bash
npm install
```

Requires Node 20+. You'll also need a Cloudflare account with D1, KV, R2, and Turnstile
provisioned — follow **[docs/cloudflare-setup.md](docs/cloudflare-setup.md)** for the full
walkthrough (creating resources, running migrations, seeding data, setting secrets). That
doc also tracks what's currently provisioned on the live StarThink deployment.

Once resources exist and `.dev.vars` / `.env` are filled in (copy from the `.example`
files in `apps/worker` and `apps/web`):

```bash
npm run dev:worker   # http://localhost:8787
npm run dev:web      # http://localhost:5173 (proxies /api to the worker)
```

## Scripts

Run from the repo root unless noted:

| Command | What it does |
|---|---|
| `npm run dev:web` / `npm run dev:worker` | Start the frontend / worker dev server |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | Type-check all workspaces |
| `npm run db:generate` | Generate a Drizzle migration from `packages/database/src/schema.ts` into `apps/worker/migrations/` |
| `npm run db:migrate:local` / `npm run db:migrate:remote` | Apply migrations to local (miniflare) or remote D1 |

Deploying: `npx wrangler deploy` from `apps/worker` or `apps/web` (each has its own
`wrangler.toml`). The web app must be rebuilt (`npm run build` or `npx vite build`) before
each deploy.

## How scoring works

Everything that determines a report's outcome is data, not code — admins configure it
through the panel, not by editing source:

- **Categories** (`categories` table) group questions and appear as radar-chart axes.
- **Questions & options** each carry a point value; a category's score is
  `points earned / points possible` across its active questions.
- **Business status bands** (Excellent / Very Good / Good / Needs Improvement / Critical)
  are configurable thresholds, not hardcoded (`packages/shared/src/business-status.ts`
  ships sane defaults, seeded into `scoring_config`).
- **Recommendation rules** are `IF <category or overall score> <operator> <threshold> THEN
  show this advice` — evaluated fresh against every report and PDF.

The scoring and recommendation engines (`packages/shared/src/scoring.ts`,
`recommendations.ts`) are pure functions with no DB dependency, shared verbatim between the
worker (reports, PDFs) and could be unit-tested in isolation.

## Admin panel

All under `/admin` (JWT-protected after `/admin/login`):

| Section | What it manages |
|---|---|
| Dashboard | Quick totals |
| Questions | Question bank — prompt, category, options/scores, active state |
| Categories | The 10 (extensible) assessment categories |
| Recommendations | The `IF score < X THEN show advice` rule engine |
| Assessment History | Every submission — business info + full answer breakdown |
| Analytics | Completion rate, score distribution, weakest categories across all submissions |
| Admin Users | Manage who can log into the panel (guards against self-delete / deleting the last admin) |

## REST API

Public:
```
POST /api/assessment/start        start an assessment (Turnstile-gated)
GET  /api/questions                active questions, grouped by category
POST /api/assessment/submit        submit answers, compute score
GET  /api/report/:id               scored report (JSON)
GET  /api/report/:id/pdf           scored report (PDF, cached in R2)
```

Admin (all require `Authorization: Bearer <jwt>` except login):
```
POST   /api/admin/login
GET    /api/admin/questions        POST/PUT/DELETE .../:id
GET    /api/admin/categories       POST/PUT/DELETE .../:id
GET    /api/admin/recommendations  POST/PUT/DELETE .../:id
GET    /api/admin/assessments      GET .../:id  (full detail)
GET    /api/admin/analytics
GET    /api/admin/users            POST/PUT/DELETE .../:id
```

Every endpoint returns `{ success: true, data }` or `{ success: false, error: { message, code } }`
(see `packages/api/src/envelope.ts`). Route paths are centralized in
`packages/api/src/routes.ts` so the frontend client and worker router can't drift apart.

## Design system

`apps/web/src/styles.css` defines the token set (colors, the brand green `#5af503`, dark
mode) as Tailwind v4 `@theme` custom properties. Notably, the raw brand green fails contrast
as text/borders on light surfaces — darker verified steps (`accent-text`, `accent-panel`)
are used for anything that needs to be read, with the raw color reserved for solid fills
paired with dark text. See the comment block at the top of that file for the full rationale.
