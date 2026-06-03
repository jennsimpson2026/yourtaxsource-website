import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { invoices, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPaymentReceived, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";

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

        await db.update(taxReturns)
          .set({ paymentStatus: "PAID" })
          .where(eq(taxReturns.id, invoice.returnId));

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
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Helcim Webhook Error:", error.message);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
