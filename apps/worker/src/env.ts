export interface Env {
  DB: D1Database;
  REPORTS: R2Bucket;
  CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  JWT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
  ADMIN_SESSION_TTL_SECONDS: string;
  ENVIRONMENT: string;
  WEB_APP_URL: string;
}
