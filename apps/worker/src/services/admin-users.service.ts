import { eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { adminUsers, type Database } from "@bhc/database";
import type { AdminUser } from "@bhc/shared";
import type { CreateAdminUserInput, UpdateAdminUserInput } from "@bhc/validation";
import { hashPassword } from "../lib/password";
import { newId } from "../lib/ids";

function toAdminUser(row: { id: string; email: string; name: string; createdAt: string }): AdminUser {
  return { id: row.id, email: row.email, name: row.name, createdAt: row.createdAt };
}

export async function listAdminUsers(db: Database): Promise<AdminUser[]> {
  const rows = await db.select().from(adminUsers);
  return rows.map(toAdminUser).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createAdminUser(db: Database, input: CreateAdminUserInput): Promise<AdminUser> {
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, input.email)).limit(1);
  if (existing) {
    throw new HTTPException(409, { message: `An admin with email "${input.email}" already exists` });
  }

  const id = newId("admin");
  const passwordHash = await hashPassword(input.password);
  await db.insert(adminUsers).values({ id, email: input.email, passwordHash, name: input.name });

  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return toAdminUser(row!);
}

export async function updateAdminUser(db: Database, id: string, input: UpdateAdminUserInput): Promise<AdminUser> {
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;
  await db
    .update(adminUsers)
    .set({ name: input.name, ...(passwordHash ? { passwordHash } : {}) })
    .where(eq(adminUsers.id, id));

  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return toAdminUser(row!);
}

export async function deleteAdminUser(db: Database, id: string, currentAdminId: string): Promise<void> {
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  if (!existing) {
    throw new HTTPException(404, { message: "Admin user not found" });
  }
  if (id === currentAdminId) {
    throw new HTTPException(400, { message: "You can't delete your own account while signed in as it." });
  }

  const countRows = await db.select({ count: sql<number>`count(*)` }).from(adminUsers);
  if ((countRows[0]?.count ?? 0) <= 1) {
    throw new HTTPException(400, { message: "Can't delete the last remaining admin account." });
  }

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
}
