import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, profiles, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isStaff, staffOnlyResponse, getSession } from "@/lib/auth-utils";
import { notifyDocumentRequest } from "@/lib/notifications";

export async function POST(req: Request) {
  if (!(await isStaff())) {
    return staffOnlyResponse();
  }

  const session = await getSession();

  try {
    const body = await req.json();
    const { clientId, documentList } = body;

    if (!clientId || !documentList) {
      return NextResponse.json({ error: "clientId and documentList are required" }, { status: 400 });
    }

    const client = await db.query.users.findFirst({
      where: eq(users.id, clientId),
      with: {
        profile: true,
      },
    });

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Trigger notification
    await notifyDocumentRequest(
      client.email,
      client.profile?.phone || null,
      documentList
    );

    // Audit log
    await db.insert(auditLogs).values({
      userId: session?.user?.id,
      action: "REQUEST_DOCUMENTS",
      targetType: "USER",
      targetId: clientId,
      metadata: JSON.stringify({ documentList }),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/admin/documents/request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
