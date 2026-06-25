import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";
import { syncPaymentToQbo } from "@/lib/qbo";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    const signature = req.headers.get("X-Helcim-Signature");
    
    // Validate signature in production
    const secret = process.env.HELCIM_WEBHOOK_SECRET;
    if (secret && signature) {
      const computedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");
      
      if (computedSignature !== signature) {
        console.warn("[HelcimWebhook] Invalid signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const { event, data } = payload;
    const eventId = data.invoiceId; // Using invoiceId as part of idempotency key

    if (event === "invoice.paid") {
      // Idempotency check: Have we already processed this specific payment?
      const existingLog = await db.query.auditLogs.findFirst({
        where: and(
          eq(auditLogs.action, "PAYMENT_RECEIVED"),
          eq(auditLogs.targetId, eventId)
        )
      });

      if (existingLog) {
        console.log(`[HelcimWebhook] Event ${eventId} already processed. Skipping.`);
        return NextResponse.json({ received: true, skipped: true });
      }

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
          targetId: eventId, // Match the idempotency check
          metadata: JSON.stringify({ amount: invoice.amount, invoiceId: invoice.id }),
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
