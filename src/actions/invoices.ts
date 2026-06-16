"use server";

import { db } from "@/lib/db";
import { invoices, auditLogs, taxReturns, users } from "@/lib/db/schema";
import { createQboInvoice, createIntuitPaymentLink, getOrCreateQboCustomer } from "@/lib/qbo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function initializePaymentSession(invoiceId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const invoice = await db.query.invoices.findFirst({
    where: and(
      eq(invoices.id, invoiceId),
      eq(invoices.userId, userId)
    ),
    with: {
      user: true,
    },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "PAID") throw new Error("Invoice already paid");

  // Create or get Intuit Payment Link
  const paymentLink = await createIntuitPaymentLink(
    Number(invoice.amount),
    invoice.currency,
    `Tax Preparation Services - Invoice #${invoice.id.slice(0, 8)}`
  );

  return {
    paymentUrl: paymentLink.url,
  };
}

export async function createInvoice(returnId: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const taxReturn = await db.query.taxReturns.findFirst({
    where: eq(taxReturns.id, returnId),
    with: {
      client: true,
    },
  });

  if (!taxReturn) throw new Error("Tax return not found");

  // 1. Ensure QBO Customer exists
  const qboCustomerId = await getOrCreateQboCustomer(taxReturn.clientId);

  // 2. Create QBO Invoice
  const qboInvoice = await createQboInvoice({
    customerId: qboCustomerId,
    amount,
    description: `Tax preparation services for ${taxReturn.year}`,
  });

  // 3. Create local invoice
  const [invoice] = await db.insert(invoices).values({
    userId: taxReturn.clientId,
    returnId: taxReturn.id,
    amount: amount,
    currency: "USD",
    qboInvoiceId: qboInvoice.Invoice.Id,
    status: "UNPAID",
  }).returning();

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "CREATE_INVOICE",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ amount, qboInvoiceId: qboInvoice.Invoice.Id }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return invoice;
}
