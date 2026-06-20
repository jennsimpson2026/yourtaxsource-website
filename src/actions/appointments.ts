"use server";

import { db } from "@/lib/db";
import { appointments, auditLogs } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function logAppointment(data: {
  bookingId: string;
  startTime: Date;
  endTime: Date;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  const [appointment] = await db.insert(appointments).values({
    userId,
    bookingId: data.bookingId,
    startTime: data.startTime,
    endTime: data.endTime,
    status: "SCHEDULED",
  }).returning();

  await db.insert(auditLogs).values({
    userId,
    action: "BOOK_APPOINTMENT",
    targetType: "APPOINTMENT",
    targetId: appointment.id,
    metadata: JSON.stringify({ bookingId: data.bookingId }),
  });

  revalidatePath("/portal");
  return appointment;
}

export async function getUserAppointments() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as any).id;

  return db.query.appointments.findMany({
    where: eq(appointments.userId, userId),
    orderBy: (apt, { desc }) => [desc(apt.startTime)],
  });
}
