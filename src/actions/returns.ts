"use server";

import { db } from "@/lib/db";
import { taxReturns, auditLogs, users, profiles, invoices } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { notifyStatusUpdate, notifyAdminPaymentReceived } from "@/lib/notifications";
import { releaseReturnDocuments } from "@/lib/returns";

export async function updateReturnDetails(returnId: string, data: {
  status?: string;
  paymentStatus?: string;
  notes?: string;
  federalResult?: number;
  stateResults?: any;
  manualRelease?: boolean;
  isComplimentary?: boolean;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const updateData: any = { updatedAt: new Date() };
  if (data.status) updateData.status = data.status;
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
  if (data.notes !== undefined) updateData.notes = data.notes;
  if (data.federalResult !== undefined) updateData.federalResult = data.federalResult;
  if (data.stateResults !== undefined) updateData.stateResults = JSON.stringify(data.stateResults);
  if (data.manualRelease !== undefined) updateData.manualRelease = data.manualRelease;
  if (data.isComplimentary !== undefined) updateData.isComplimentary = data.isComplimentary;

  const [updatedReturn] = await db.update(taxReturns)
    .set(updateData)
    .where(eq(taxReturns.id, returnId))
    .returning();

  if (updatedReturn) {
    const client = await db.query.users.findFirst({
      where: eq(users.id, updatedReturn.clientId),
      with: {
        profile: true,
      },
    });

    if (client) {
      if (data.status) {
        await notifyStatusUpdate(client.email, client.profile?.phone || null, data.status);
      }

      if (data.paymentStatus === "PAID" || data.manualRelease === true || data.isComplimentary === true) {
        // Release documents on payment or manual release
        await releaseReturnDocuments(returnId, (session.user as any).id);

        if (data.paymentStatus === "PAID") {
          const unpaidInvoices = await db.query.invoices.findMany({
            where: and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")),
          });
          
          const totalAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
          
          // Mark invoices as paid if manual payment entry
          if (unpaidInvoices.length > 0) {
            await db.update(invoices)
              .set({ status: "PAID", paidAt: new Date() })
              .where(and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")));
          }

          await notifyAdminPaymentReceived({
            clientName: client.name || "Client",
            amount: totalAmount,
            method: "Manual Entry (Admin)",
            invoiceReference: `Return ${updatedReturn.year}`,
          });
        }
      }
    }
  }

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "UPDATE_RETURN_DETAILS",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify(data),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
}

export async function updateReturnStatus(returnId: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const [updatedReturn] = await db.update(taxReturns)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId))
    .returning();

  if (updatedReturn) {
    const client = await db.query.users.findFirst({
      where: eq(users.id, updatedReturn.clientId),
      with: {
        profile: true,
      },
    });

    if (client) {
      await notifyStatusUpdate(client.email, client.profile?.phone || null, status);
    }
  }

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "UPDATE_RETURN_STATUS",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ newStatus: status }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
}

export async function manualReleaseReturn(returnId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  await db.update(taxReturns)
    .set({ manualRelease: true, updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await releaseReturnDocuments(returnId, (session.user as any).id);

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  return { success: true };
}

export async function markReturnAsComplimentary(returnId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  await db.update(taxReturns)
    .set({ isComplimentary: true, paymentStatus: "PAID", updatedAt: new Date() })
    .where(eq(taxReturns.id, returnId));

  await releaseReturnDocuments(returnId, (session.user as any).id);

  revalidatePath(`/admin/returns/${returnId}`);
  revalidatePath("/admin/returns");
  return { success: true };
}

export async function setReturnFee(returnId: string, amount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  // Find existing invoice or create new one
  const existingInvoice = await db.query.invoices.findFirst({
    where: and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")),
  });

  if (existingInvoice) {
    await db.update(invoices)
      .set({ amount: amount })
      .where(eq(invoices.id, existingInvoice.id));
  } else {
    const taxReturn = await db.query.taxReturns.findFirst({
      where: eq(taxReturns.id, returnId),
    });
    if (!taxReturn) throw new Error("Return not found");

    await db.insert(invoices).values({
      userId: taxReturn.clientId,
      returnId: returnId,
      amount: amount,
      status: "UNPAID",
    });
  }

  await db.insert(auditLogs).values({
    userId: (session.user as any).id,
    action: "SET_RETURN_FEE",
    targetType: "TAX_RETURN",
    targetId: returnId,
    metadata: JSON.stringify({ amount }),
  });

  revalidatePath(`/admin/returns/${returnId}`);
  return { success: true };
}
