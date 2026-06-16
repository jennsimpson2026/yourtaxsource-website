import { NextResponse } from "next/server";
import { getQboAuthUrl } from "@/lib/qbo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = getQboAuthUrl();
  return NextResponse.redirect(url);
}
