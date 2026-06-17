"use server";

import { db } from "@/lib/db";
import { invoices } from "@/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { syncPaymentToQbo } from "@/lib/qbo";
import { auth } from "@/lib/auth";


export async function syncAllPendingPayments() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const pendingInvoices = await db.query.invoices.findMany({
    where: and(
      eq(invoices.status, "PAID"),
      isNull(invoices.qboSalesReceiptId)
    ),
  });

  const results = {
    total: pendingInvoices.length,
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const invoice of pendingInvoices) {
    try {
      await syncPaymentToQbo(invoice.id);
      results.success++;
    } catch (error: any) {
      results.failed++;
      results.errors.push(`Invoice ${invoice.id}: ${error.message}`);
    }
  }

  return results;
}
