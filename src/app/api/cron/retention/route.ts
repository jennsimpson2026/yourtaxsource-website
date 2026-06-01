import { permanentlyDeleteOldDocuments } from "@/actions/documents";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deletedCount = await permanentlyDeleteOldDocuments();
    return NextResponse.json({ 
      success: true, 
      message: `Permanently deleted ${deletedCount} documents.` 
    });
  } catch (error) {
    console.error("Retention cleanup error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
