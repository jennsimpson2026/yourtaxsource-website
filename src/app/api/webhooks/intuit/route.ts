import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";
import { getQboInvoice } from "@/lib/qbo";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Intuit Webhook Payload
    // https://developer.intuit.com/app/developer/qbo/docs/develop/webhooks
    // {
    //   "eventNotifications": [
    //     {
    //       "realmId": "123456789",
    //       "dataChangeEvent": {
    //         "entities": [
    //           {
    //             "name": "Invoice",
    //             "id": "123",
    //             "operation": "Update",
    //             "lastUpdated": "2023-01-01T00:00:00Z"
    //           }
    //         ]
    //       }
    //     }
    //   ]
    // }

    for (const notification of payload.eventNotifications) {
      for (const entity of notification.dataChangeEvent.entities) {
        if (entity.name === "Invoice" || entity.name === "Payment") {
          // If it's an invoice, check if it's paid
          const qboId = entity.id;
          
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
                  targetId: localInvoice.id,
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
