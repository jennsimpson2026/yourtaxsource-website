import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";


export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role === "CLIENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await db.query.workflows.findMany({
    orderBy: [desc(workflows.createdAt)],
    limit: 20,
  });

  return NextResponse.json(result);
}

export async function DELETE() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Clear all workflow logs
    await db.delete(workflows);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear workflows:", error);
    return NextResponse.json({ error: "Failed to clear workflows" }, { status: 500 });
  }
}
