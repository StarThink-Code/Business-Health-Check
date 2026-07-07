import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { adminUsers, type Database } from "@bhc/database";
import type { AdminUser } from "@bhc/shared";
import { verifyPassword } from "../lib/password";

export async function loginAdmin(
  db: Database,
  email: string,
  password: string,
  jwtSecret: string,
  sessionTtlSeconds: number,
): Promise<{ token: string; admin: AdminUser }> {
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  if (!row || !(await verifyPassword(password, row.passwordHash))) {
    throw new HTTPException(401, { message: "Invalid email or password" });
  }

  const exp = Math.floor(Date.now() / 1000) + sessionTtlSeconds;
  const token = await sign({ sub: row.id, email: row.email, exp }, jwtSecret, "HS256");

  return {
    token,
    admin: { id: row.id, email: row.email, name: row.name, createdAt: row.createdAt },
  };
}
