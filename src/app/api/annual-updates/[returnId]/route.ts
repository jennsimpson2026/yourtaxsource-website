import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { annualUpdates, taxReturns, auditLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { returnId } = await params;

  try {
    // Verify ownership or staff access
    const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF";
    
    const taxReturn = await db.query.taxReturns.findFirst({
      where: isStaff 
        ? eq(taxReturns.id, returnId)
        : and(
            eq(taxReturns.id, returnId),
            eq(taxReturns.clientId, (session.user as any).id)
          ),
    });

    if (!taxReturn) {
      return NextResponse.json({ error: "Tax return not found" }, { status: 404 });
    }

    const update = await db.query.annualUpdates.findFirst({
      where: eq(annualUpdates.returnId, returnId),
    });

    if (!update) {
      return NextResponse.json(null);
    }

    // Decrypt sensitive fields
    if (update.bankingInfo) {
      try {
        const bankingData = JSON.parse(update.bankingInfo);
        if (bankingData.accountNumber) {
           bankingData.accountNumber = decrypt(bankingData.accountNumber);
        }
        update.bankingInfo = JSON.stringify(bankingData);
      } catch (e) {
        console.error("Failed to decrypt banking info", e);
      }
    }

    if (update.dependents) {
      try {
        const dependents = JSON.parse(update.dependents);
        dependents.forEach((dep: any) => {
          if (dep.ssn) {
            dep.ssn = decrypt(dep.ssn);
          }
        });
        update.dependents = JSON.stringify(dependents);
      } catch (e) {
        console.error("Failed to decrypt dependents", e);
      }
    }

    // If staff viewed it, log it
    if (isStaff) {
      await db.insert(auditLogs).values({
        userId: (session.user as any).id,
        action: "VIEW_CLIENT_RECORD",
        targetType: "ANNUAL_UPDATE",
        targetId: returnId,
        metadata: JSON.stringify({ clientId: taxReturn.clientId }),
      });
    }

    return NextResponse.json(update);
  } catch (error: any) {
    console.error("GET annual-update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { returnId } = await params;
  const body = await req.json();

  try {
    // Verify ownership
    const taxReturn = await db.query.taxReturns.findFirst({
      where: and(
        eq(taxReturns.id, returnId),
        eq(taxReturns.clientId, (session.user as any).id)
      ),
    });

    if (!taxReturn) {
      return NextResponse.json({ error: "Tax return not found" }, { status: 404 });
    }

    // Prepare data
    const updateData: any = {
      status: body.status || "DRAFT",
      taxInfo: body.taxInfo ? JSON.stringify(body.taxInfo) : null,
      priorYearChanges: body.priorYearChanges || null,
      updatedAt: new Date(),
    };

    // Encrypt sensitive fields in bankingInfo
    if (body.bankingInfo) {
      const bankingData = typeof body.bankingInfo === "string" ? JSON.parse(body.bankingInfo) : body.bankingInfo;
      if (bankingData.accountNumber) {
         bankingData.accountNumber = encrypt(bankingData.accountNumber);
      }
      updateData.bankingInfo = JSON.stringify(bankingData);
    }

    // Encrypt sensitive fields in dependents
    if (body.dependents) {
        const dependents = typeof body.dependents === "string" ? JSON.parse(body.dependents) : body.dependents;
        dependents.forEach((dep: any) => {
          if (dep.ssn) {
            dep.ssn = encrypt(dep.ssn);
          }
        });
        updateData.dependents = JSON.stringify(dependents);
    }

    const existingUpdate = await db.query.annualUpdates.findFirst({
        where: eq(annualUpdates.returnId, returnId),
    });

    if (existingUpdate) {
        await db.update(annualUpdates)
            .set(updateData)
            .where(eq(annualUpdates.id, existingUpdate.id));
    } else {
        await db.insert(annualUpdates).values({
            ...updateData,
            clientId: (session.user as any).id,
            returnId: returnId,
        });
    }

    // Audit Log
    await db.insert(auditLogs).values({
        userId: (session.user as any).id,
        action: "UPDATE_ANNUAL_DATA",
        targetType: "ANNUAL_UPDATE",
        targetId: returnId,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST annual-update error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
