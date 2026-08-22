import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  return NextResponse.json({
    OPENAI_API_KEY_SET: !!process.env.OPENAI_API_KEY,
    TAVILY_API_KEY_SET: !!process.env.TAVILY_API_KEY,
    RESEND_API_KEY_SET: !!process.env.RESEND_API_KEY,
    DATABASE_URL_SET: !!process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL,
  });
}
