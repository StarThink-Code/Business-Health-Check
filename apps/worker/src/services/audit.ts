import { auditLogs, type Database } from "@bhc/database";
import { newId } from "../lib/ids";

export async function recordAuditLog(
  db: Database,
  params: {
    adminUserId: string;
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  await db.insert(auditLogs).values({
    id: newId("audit"),
    adminUserId: params.adminUserId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    metadata: params.metadata ? JSON.stringify(params.metadata) : null,
  });
}
