import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";
import { fail } from "@bhc/api";
import type { Env } from "../env";

export const errorHandler: ErrorHandler<{ Bindings: Env }> = (err, c) => {
  if (err instanceof ZodError) {
    return c.json(fail(err.issues[0]?.message ?? "Invalid request", "VALIDATION_ERROR"), 400);
  }

  if (err instanceof HTTPException) {
    return c.json(fail(err.message, "HTTP_ERROR"), err.status);
  }

  console.error("Unhandled error", err);
  return c.json(fail("Something went wrong. Please try again.", "INTERNAL_ERROR"), 500);
};
