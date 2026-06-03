"use server";

import { db } from "@/lib/db";
import { taxReturns, auditLogs, users, profiles, invoices } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { notifyStatusUpdate, notifyAdminPaymentReceived } from "@/lib/notifications";

export async function updateReturnDetails(returnId: string, data: {
  status?: string;
  paymentStatus?: string;
  notes?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role === "CLIENT") throw new Error("Unauthorized");

  const updateData: any = { updatedAt: new Date() };
  if (data.status) updateData.status = data.status;
  if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
  if (data.notes !== undefined) updateData.notes = data.notes;

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

      if (data.paymentStatus === "PAID") {
        const unpaidInvoices = await db.query.invoices.findMany({
          where: and(eq(invoices.returnId, returnId), eq(invoices.status, "UNPAID")),
        });
        
        const totalAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
        
        await notifyAdminPaymentReceived({
          clientName: client.name || "Client",
          amount: totalAmount,
          method: "Manual Entry (Admin)",
          invoiceReference: `Return ${updatedReturn.year}`,
        });
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
