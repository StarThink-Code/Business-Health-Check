# Cloudflare Setup

## Current status (StarThink account, starthinkmy@gmail.com)

Done:
- ✅ `wrangler login` authenticated
- ✅ D1 database `bhc-db` created and migrated (`d4e08642-e2cd-4a6c-80a6-aa8e90da2116`)
- ✅ KV namespaces `CACHE` and `RATE_LIMIT` created
- ✅ R2 enabled and `bhc-reports` bucket created, bound as `REPORTS`
- ✅ Categories + default scoring bands seeded, plus 20 sample questions
- ✅ First admin user created (`starthinkmy@gmail.com`)
- ✅ `JWT_SECRET` set as a Worker secret
- ✅ `TURNSTILE_SECRET_KEY` set to Cloudflare's test key (always-pass) — see
  "Still needed" below to swap in a real widget
- ✅ Worker deployed: **https://bhc-worker.starthinkmy.workers.dev**
- ✅ Web app deployed (Workers static assets): **https://bhc-web.starthinkmy.workers.dev**

Still needed:
- ⬜ Create a real Turnstile widget and swap the test key for the real
  Site Key (`apps/web` build) / Secret Key (`TURNSTILE_SECRET_KEY` on the
  worker) — see step 8 below. Currently anyone's submission auto-passes
  verification since it's still on Cloudflare's test key.
- ⬜ R2 bucket is bound but unused — PDF report generation isn't built yet.

The steps below are the full walkthrough, kept for reference / for setting up
a second environment.

## 1. Create an account and authenticate the CLI

```
cd apps/worker
npx wrangler login
```

## 2. Create the D1 database

```
npx wrangler d1 create bhc-db
```

Copy the `database_id` into `[[d1_databases]]` in `wrangler.toml`.

## 3. Create the KV namespaces

```
npx wrangler kv namespace create CACHE
npx wrangler kv namespace create RATE_LIMIT
```

## 4. Enable R2, then create the bucket

R2 must be turned on once in the dashboard (Cloudflare dashboard → R2 →
Enable) before the API will let you create a bucket:

```
npx wrangler r2 bucket create bhc-reports
```

Then uncomment the `[[r2_buckets]]` blocks in `wrangler.toml`.

## 5. Run the database migrations

```
npm run db:generate       # from repo root — regenerate after schema changes
cd apps/worker
npm run db:migrate:local
npm run db:migrate:remote
```

## 6. Seed categories and default scoring bands

```
npx wrangler d1 execute bhc-db --remote --file=../../scripts/seed-categories-and-scoring.sql
```

## 7. Create an admin user

```
node ../../scripts/create-admin.mjs you@example.com "a-strong-password" "Your Name"
```

Run the printed `wrangler d1 execute --remote --command "..."` line.

## 8. Turnstile (still pending)

1. Cloudflare dashboard → Turnstile → Add widget, get a **Site Key** and
   **Secret Key**.
2. `npx wrangler secret put TURNSTILE_SECRET_KEY` (paste the Secret Key).
3. Put the Site Key in `apps/web/.env` as `VITE_TURNSTILE_SITE_KEY`.
4. For local dev, `apps/worker/.dev.vars` can use Cloudflare's test keys
   (always pass, never real-world valid): site key `1x00000000000000000000AA`,
   secret key `1x0000000000000000000000000000000AA`.

## 9. Run it locally

```
npm run dev:worker   # http://localhost:8787
npm run dev:web      # http://localhost:5173, proxies /api to the worker
```

## 10. Deploy

```
cd apps/worker && npm run deploy
cd apps/web && npm run build   # then deploy dist/ via Cloudflare Pages or Workers Assets
```

Note: `wrangler.toml`'s `[env.production]` block currently points at the
*same* D1/KV resources as the default environment — dev and prod share one
database right now. Create separate resources later if you want isolation
before real users hit this.
