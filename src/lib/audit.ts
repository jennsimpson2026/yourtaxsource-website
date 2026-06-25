import { db } from "./db";
import { auditLogs } from "./db/schema";
import { logger } from "./logger";
import { headers } from "next/headers";

export type AuditAction = 
  | "SIGN_IN" | "SIGN_OUT" | "RESET_PASSWORD" | "SETUP_PASSWORD"
  | "UPDATE_RETURN_STATUS" | "UPDATE_RETURN_DETAILS"
  | "SUBMIT_QUESTIONNAIRE" | "SAVE_QUESTIONNAIRE_DRAFT"
  | "CREATE_INVOICE" | "PAY_INVOICE"
  | "UPLOAD_DOCUMENT" | "APPROVE_DOCUMENT" | "REJECT_DOCUMENT"
  | "REQUEST_DOCUMENT" | "DELETE_DOCUMENT"
  | "CREATE_APPOINTMENT" | "CANCEL_APPOINTMENT"
  | "CREATE_RESOURCE" | "UPDATE_RESOURCE" | "DELETE_RESOURCE"
  | "QBO_SYNC" | "PII_ACCESS"
  | "MFA_ENABLED" | "MFA_RECOVERY_GEN";

export async function logAction(args: {
  userId: string;
  action: AuditAction | string;
  targetType: string;
  targetId?: string;
  metadata?: any;
  status?: string;
}) {
  let ipAddress = "127.0.0.1";
  try {
    const h = await headers();
    ipAddress = h.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  } catch (e) {
    // headers() might fail in background contexts
  }
  
  try {
    // 1. Log to Database (Audit Trail)
    await db.insert(auditLogs).values({
      userId: args.userId,
      action: args.action,
      targetType: args.targetType,
      targetId: args.targetId,
      metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      status: args.status || "SUCCESS",
      ipAddress,
    });

    // 2. Log to Axiom (Structured Logging)
    logger.info(`Audit: ${args.action}`, {
      userId: args.userId,
      targetType: args.targetType,
      targetId: args.targetId,
      status: args.status,
      ipAddress,
      metadata: args.metadata
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
    logger.error("Failed to log audit action", { error, args });
  }
}

export async function logPiiRead(userId: string, clientId: string, fields: string[]) {
  return logAction({
    userId,
    action: "PII_ACCESS",
    targetType: "CLIENT",
    targetId: clientId,
    metadata: { fields }
  });
}
