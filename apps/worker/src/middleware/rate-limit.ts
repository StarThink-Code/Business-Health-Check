import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { Env } from "../env";

interface RateLimitOptions {
  /** Unique name for the limited route, used as part of the KV key. */
  key: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Fixed-window rate limiter backed by KV. Good enough for public-form abuse
 * prevention; not intended for strict/precise limiting.
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler<{ Bindings: Env }> {
  return async (c, next) => {
    const ip = c.req.header("cf-connecting-ip") ?? "unknown";
    const window = Math.floor(Date.now() / (options.windowSeconds * 1000));
    const kvKey = `ratelimit:${options.key}:${ip}:${window}`;

    const current = Number((await c.env.RATE_LIMIT.get(kvKey)) ?? "0");
    if (current >= options.limit) {
      throw new HTTPException(429, { message: "Too many requests. Please try again shortly." });
    }

    await c.env.RATE_LIMIT.put(kvKey, String(current + 1), {
      expirationTtl: options.windowSeconds,
    });

    await next();
  };
}
