import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";
import { getQboInvoice } from "@/lib/qbo";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    const signature = req.headers.get("intuit-signature");
    
    // Validate signature in production
    const secret = process.env.INTUIT_WEBHOOK_SECRET;
    if (secret && signature) {
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("base64");
      
      if (computedSignature !== signature) {
        console.warn("[IntuitWebhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    for (const notification of payload.eventNotifications) {
      for (const entity of notification.dataChangeEvent.entities) {
        if (entity.name === "Invoice" || entity.name === "Payment") {
          const qboId = entity.id;
          
          // Idempotency check: Use a unique key for this specific entity update
          const idempotencyKey = `intuit-${notification.realmId}-${entity.name}-${qboId}-${entity.lastUpdated}`;
          
          const existingLog = await db.query.auditLogs.findFirst({
            where: and(
              eq(auditLogs.action, "PAYMENT_RECEIVED_INTUIT"),
              eq(auditLogs.targetId, idempotencyKey)
            )
          });

          if (existingLog) {
            console.log(`[IntuitWebhook] Event ${idempotencyKey} already processed. Skipping.`);
            continue;
          }

          // Find our local invoice
          const localInvoice = await db.query.invoices.findFirst({
            where: eq(invoices.qboInvoiceId, qboId),
            with: {
                user: {
                  with: {
                    profile: true
                  }
                },
            },
          });

          if (localInvoice && localInvoice.status !== "PAID") {
            // Fetch latest from QBO to verify status
            const qboInvoice = await getQboInvoice(qboId);
            
            // In QBO, "Balance" becomes 0 when paid
            if (qboInvoice.Invoice.Balance === 0) {
                await db.update(invoices)
                  .set({ status: "PAID", paidAt: new Date() })
                  .where(eq(invoices.id, localInvoice.id));

                await db.update(taxReturns)
                  .set({ paymentStatus: "PAID" })
                  .where(eq(taxReturns.id, localInvoice.returnId));

                // Release documents on payment
                await releaseReturnDocuments(localInvoice.returnId);

                await db.insert(auditLogs).values({
                  userId: localInvoice.userId,
                  action: "PAYMENT_RECEIVED_INTUIT",
                  targetType: "INVOICE",
                  targetId: idempotencyKey,
                  metadata: JSON.stringify({ amount: localInvoice.amount, qboId }),
                });

                await notifyPaymentReceived(
                  localInvoice.user.email, 
                  (localInvoice.user as any).profile?.phone || null, 
                  Number(localInvoice.amount)
                );

                await notifyAdminPaymentReceived({
                  clientName: (localInvoice.user as any).name || "Client",
                  amount: Number(localInvoice.amount),
                  method: "Intuit Payments",
                  invoiceReference: localInvoice.id,
                });
            }
          }
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Intuit Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
