import { storage } from "../storage";

export async function logAudit(
  actor: string,
  action: string,
  entity: string,
  entityId: string,
  metadata?: any
) {
  await storage.createAuditLog({
    actor,
    action,
    entity,
    entityId,
    metadata,
  });
}
