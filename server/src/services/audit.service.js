import { randomUUID } from "node:crypto";
import { query } from "../db.js";

export async function writeAuditLog({ request, action, entityType, entityId = null, metadata = null }) {
  await query(
    `INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [randomUUID(), request.auth?.userId ?? null, action, entityType, entityId, metadata, request.ip ?? null],
  );
}
