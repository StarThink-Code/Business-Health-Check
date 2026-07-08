import { isNotNull } from "drizzle-orm";
import { assessments, type Database } from "@bhc/database";

/**
 * Category labels and recommendation rules both feed into every generated
 * PDF. Since PDFs are cached in R2 keyed by assessment (see
 * getOrGenerateReportPdf), a rule/category change after a PDF was generated
 * would otherwise leave stale PDFs served forever. Clearing the cache pointer
 * forces the next download to regenerate from current data.
 */
export async function invalidateCachedReportPdfs(db: Database): Promise<void> {
  await db.update(assessments).set({ reportPdfKey: null }).where(isNotNull(assessments.reportPdfKey));
}
