import { desc, sql } from "drizzle-orm";
import { assessments, type Database } from "@bhc/database";
import type { Assessment } from "@bhc/shared";

export async function listAssessments(
  db: Database,
  pagination: { page: number; pageSize: number },
): Promise<{ assessments: Assessment[]; total: number }> {
  const offset = (pagination.page - 1) * pagination.pageSize;

  const rows = await db
    .select()
    .from(assessments)
    .orderBy(desc(assessments.startedAt))
    .limit(pagination.pageSize)
    .offset(offset);

  const countRows = await db.select({ count: sql<number>`count(*)` }).from(assessments);
  const count = countRows[0]?.count ?? 0;

  return {
    assessments: rows.map((r) => ({
      id: r.id,
      businessId: r.businessId,
      status: r.status as Assessment["status"],
      overallScore: r.overallScore,
      businessStatus: r.businessStatus as Assessment["businessStatus"],
      startedAt: r.startedAt,
      completedAt: r.completedAt,
    })),
    total: count,
  };
}
