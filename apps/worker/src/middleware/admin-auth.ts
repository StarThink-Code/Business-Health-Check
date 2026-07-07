import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import type { Env } from "../env";

export interface AdminJwtPayload {
  sub: string; // admin user id
  email: string;
  exp: number;
}

/** Verifies the `Authorization: Bearer <jwt>` header and attaches the payload to context. */
export const requireAdmin: MiddlewareHandler<{
  Bindings: Env;
  Variables: { admin: AdminJwtPayload };
}> = async (c, next) => {
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    throw new HTTPException(401, { message: "Admin authentication required" });
  }

  try {
    const payload = (await verify(token, c.env.JWT_SECRET, "HS256")) as unknown as AdminJwtPayload;
    c.set("admin", payload);
  } catch {
    throw new HTTPException(401, { message: "Invalid or expired session" });
  }

  await next();
};
