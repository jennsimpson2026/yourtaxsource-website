import { NextResponse } from "next/server";
import { exchangeQboCode } from "@/lib/qbo";
import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const realmId = searchParams.get("realmId");
  const state = searchParams.get("state");

  if (state !== "qbo-connect") {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code || !realmId) {
    return NextResponse.json({ error: "Missing code or realmId" }, { status: 400 });
  }

  try {
    await exchangeQboCode(code, realmId);

    const session = await getServerSession(authOptions);
    if (session) {
        await db.insert(auditLogs).values({
            userId: (session.user as any).id,
            action: "QBO_CONNECTED",
            targetType: "SYSTEM",
            metadata: JSON.stringify({ realmId }),
        });
    }

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/admin/settings?qbo=connected`);
  } catch (error: any) {
    console.error("QBO Callback Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to connect QuickBooks" }, { status: 500 });
  }
}
