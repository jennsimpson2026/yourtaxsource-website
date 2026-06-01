import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}

export async function isStaff() {
  const session = await getSession();
  return session?.user?.role === "ADMIN" || session?.user?.role === "STAFF";
}

export function adminOnlyResponse() {
  return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
}

export function staffOnlyResponse() {
  return NextResponse.json({ error: "Forbidden: Staff access required" }, { status: 403 });
}
