import { NextResponse } from "next/server";
import { workflowClient } from "@/lib/workflow";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { auth } from "@/lib/auth";


export async function POST() {
  const session = await auth();
  if (!session || (session.user as any).role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { workflowRunId } = await workflowClient.trigger({
      url: `${process.env.NEXTAUTH_URL}/api/workflow/qbo-sync`,
      body: {}, // Sync all
    });

    await db.insert(workflows).values({
      id: workflowRunId,
      name: "Bulk QBO Sync",
      status: "running",
      data: JSON.stringify({ trigger: "manual", by: session.user.email }),
    });

    return NextResponse.json({ success: true, workflowRunId });
  } catch (error: any) {
    console.error("Bulk sync trigger error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
