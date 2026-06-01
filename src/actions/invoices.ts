"use server";

import { db } from "@/lib/db";
import { invoices, auditLogs, taxReturns, users } from "@/lib/db/schema";
import { createHelcimInvoice, initializeHelcimPay } from "@/lib/helcim";
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

  const helcimPaySession = await initializeHelcimPay({
    amount: Number(invoice.amount),
    currency: invoice.currency,
    orderNumber: invoice.id,
    customerCode: invoice.userId,
    contactName: (invoice as any).user.name || "Client",
    contactEmail: (invoice as any).user.email,
  });

  return {
    checkoutToken: helcimPaySession.checkoutToken,
    secretToken: helcimPaySession.secretToken,
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

  const helcimInvoice = await createHelcimInvoice({
    amount,
    currency: "USD",
    contactName: (taxReturn as any).client.name || "Client",
    contactEmail: (taxReturn as any).client.email,
  });

  const [invoice] = await db.insert(invoices).values({
    userId: taxReturn.clientId,
    returnId: taxReturn.id,
    amount: amount,
    currency: "USD",
    helcimInvoiceId: helcimInvoice.invoiceId,
    status: "UNPAID",
  }).returning();

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "CREATE_INVOICE",
    targetType: "INVOICE",
    targetId: invoice.id,
    metadata: JSON.stringify({ amount, helcimInvoiceId: helcimInvoice.invoiceId }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return invoice;
}
