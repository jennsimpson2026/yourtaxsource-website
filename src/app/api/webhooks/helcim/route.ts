import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";
import { syncPaymentToQbo } from "@/lib/qbo";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Helcim specific webhook handling
    // Validate signature in production
    const { event, data } = payload;

    if (event === "invoice.paid") {
      const helcimInvoiceId = data.invoiceId;
      
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.helcimInvoiceId, helcimInvoiceId),
        with: {
            user: {
              with: {
                profile: true
              }
            },
        },
      });

      if (invoice) {
        await db.update(invoices)
          .set({ status: "PAID", paidAt: new Date() })
          .where(eq(invoices.id, invoice.id));

        const allInvoices = await db.query.invoices.findMany({
          where: eq(invoices.returnId, invoice.returnId),
        });

        const totalPaid = allInvoices
          .filter(inv => inv.status === "PAID")
          .reduce((sum, inv) => sum + Number(inv.amount), 0);

        const hasUnpaid = allInvoices.some(inv => inv.status === "UNPAID");

        const taxReturn = await db.query.taxReturns.findFirst({
          where: eq(taxReturns.id, invoice.returnId),
        });

        const isFullyPaid = taxReturn && totalPaid >= Number(taxReturn.taxPrepFee) && !hasUnpaid;

        if (isFullyPaid) {
          await db.update(taxReturns)
            .set({ paymentStatus: "PAID", updatedAt: new Date() })
            .where(eq(taxReturns.id, invoice.returnId));

          if (taxReturn && ["AWAITING_PAYMENT", "READY_FOR_SIGNATURE"].includes(taxReturn.status)) {
            console.log(`[HelcimWebhook] Auto-transitioning return ${taxReturn.id} to READY_TO_FILE`);
            await db.update(taxReturns)
              .set({ status: "READY_TO_FILE" as any, updatedAt: new Date() })
              .where(eq(taxReturns.id, taxReturn.id));
          }
        } else {
          console.log(`[HelcimWebhook] Return ${invoice.returnId} partially paid (${totalPaid}/${taxReturn?.taxPrepFee}). No auto-transition.`);
        }

        // Release documents on payment
        await releaseReturnDocuments(invoice.returnId);

        await db.insert(auditLogs).values({
          userId: invoice.userId,
          action: "PAYMENT_RECEIVED",
          targetType: "INVOICE",
          targetId: invoice.id,
          metadata: JSON.stringify({ amount: invoice.amount }),
        });

        await notifyPaymentReceived(
          invoice.user.email, 
          (invoice.user as any).profile?.phone || null, 
          Number(invoice.amount)
        );

        await notifyAdminPaymentReceived({
          clientName: (invoice.user as any).name || "Client",
          amount: Number(invoice.amount),
          method: "Helcim",
          invoiceReference: invoice.id,
        });

        // Sync to QuickBooks
        try {
          await syncPaymentToQbo(invoice.id);
        } catch (qboError) {
          console.error("Failed to sync payment to QuickBooks:", qboError);
          // Don't fail the webhook if QBO sync fails, but log it
          await db.insert(auditLogs).values({
            userId: invoice.userId,
            action: "QBO_SYNC_FAILED",
            targetType: "INVOICE",
            targetId: invoice.id,
            metadata: JSON.stringify({ error: (qboError as any).message }),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Helcim Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
