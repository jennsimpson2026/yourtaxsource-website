import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, taxReturns, documents, auditLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { isStaff, staffOnlyResponse, getSession } from "@/lib/auth-utils";

export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const session = await getSession();
  if (!(await isStaff())) {
    return staffOnlyResponse();
  }

  const { id } = await params;

  try {
    const client = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        mfaEnabled: true,
        createdAt: true,
      },
      with: {
        profile: true,
        taxReturns: {
          orderBy: [desc(taxReturns.year)],
          with: {
            documents: true,
            invoices: true,
            questionnaire: true,
            annualUpdate: true,
          },
        },
        documents: {
          where: (docs, { isNull }) => isNull(docs.returnId),
        },
        auditLogs: {
          orderBy: [desc(auditLogs.createdAt)],
          limit: 100,
        },
      },
    });

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Log the view action
    await db.insert(auditLogs).values({
      userId: (session?.user as any).id,
      action: "VIEW_CLIENT_RECORD",
      targetType: "USER",
      targetId: id,
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error(`GET /api/admin/clients/${id} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
