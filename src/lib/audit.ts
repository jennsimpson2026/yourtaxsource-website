import { db } from "./db";
import { auditLogs } from "./db/schema";
import { auth } from "./auth";

export type AuditAction = 
  | "PII_READ" 
  | "PII_EXPORT"
  | "LOGIN"
  | "MFA_ENABLED"
  | "DOCUMENT_UPLOAD"
  | "DOCUMENT_DELETE"
  | "RETURN_UPDATE"
  | "REQUEST_DOCUMENTS"
  | "MESSAGE_SENT";

export async function logAudit(
  action: AuditAction, 
  targetType: string, 
  targetId?: string, 
  metadata?: any,
  status: "SUCCESS" | "FAILED" | "PENDING" = "SUCCESS"
) {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id;

    await db.insert(auditLogs).values({
      userId: userId || null,
      action,
      targetType,
      targetId: targetId || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      status,
      // ipAddress is tricky in server actions without passing it in, 
      // but we can omit it for now or try to get it if needed.
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}

export async function logPiiRead(clientId: string, fields: string[]) {
  return logAudit("PII_READ", "CLIENT", clientId, { fields });
}

export async function logPiiExport(count: number, year?: string) {
  return logAudit("PII_EXPORT", "SYSTEM", undefined, { count, year });
}
