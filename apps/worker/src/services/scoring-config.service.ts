import { scoringConfig, type Database } from "@bhc/database";
import {
  DEFAULT_BUSINESS_STATUS_THRESHOLDS,
  type BusinessStatus,
  type BusinessStatusThreshold,
} from "@bhc/shared";

export async function loadBusinessStatusThresholds(db: Database): Promise<BusinessStatusThreshold[]> {
  const rows = await db.select().from(scoringConfig);
  if (rows.length === 0) return DEFAULT_BUSINESS_STATUS_THRESHOLDS;

  return rows
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => ({
      status: r.status as BusinessStatus,
      label: r.label,
      minScore: r.minScore,
      maxScore: r.maxScore,
    }));
}
