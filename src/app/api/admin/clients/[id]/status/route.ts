import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taxReturns, auditLogs, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { isStaff, staffOnlyResponse, getSession } from "@/lib/auth-utils";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isStaff())) {
    return staffOnlyResponse();
  }

  const { id: clientId } = await params;
  const session = await getSession();

  try {
    const body = await req.json();
    const { returnId, status, paymentStatus } = body;

    if (!returnId) {
      return NextResponse.json({ error: "returnId is required" }, { status: 400 });
    }

    // Verify the return belongs to the client
    const existingReturn = await db.query.taxReturns.findFirst({
      where: and(
        eq(taxReturns.id, returnId),
        eq(taxReturns.clientId, clientId)
      ),
    });

    if (!existingReturn) {
      return NextResponse.json({ error: "Tax return not found for this client" }, { status: 404 });
    }

    const updateData: any = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    await db.update(taxReturns)
      .set(updateData)
      .where(eq(taxReturns.id, returnId));

    // Audit log
    await db.insert(auditLogs).values({
      userId: session?.user?.id,
      action: "UPDATE_STATUS",
      targetType: "TAX_RETURN",
      targetId: returnId,
      metadata: JSON.stringify({
        clientId,
        oldStatus: existingReturn.status,
        newStatus: status || existingReturn.status,
        oldPaymentStatus: existingReturn.paymentStatus,
        newPaymentStatus: paymentStatus || existingReturn.paymentStatus,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`PATCH /api/admin/clients/${clientId}/status error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
