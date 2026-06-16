import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, appointments, invoices, taxReturns, profiles } from "@/lib/db/schema";
import { eq, and, gte, lt, ne, isNull, or, sql } from "drizzle-orm";
import { 
  notifyUpcomingAppointmentReminder, 
  notifyUnpaidInvoiceReminder, 
  notifyActionNeededReminder 
} from "@/lib/notifications";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrowStart = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrowStart.getTime() + 24 * 60 * 60 * 1000);

    // 1. Get all clients who haven't received a reminder in the last 24 hours
    const eligibleUsers = await db.query.users.findMany({
      where: and(
        eq(users.role, "CLIENT"),
        or(
          isNull(users.lastReminderAt),
          lt(users.lastReminderAt, oneDayAgo)
        )
      ),
      with: {
        profile: true,
        appointments: {
          where: and(
            eq(appointments.status, "SCHEDULED"),
            gte(appointments.startTime, tomorrowStart),
            lt(appointments.startTime, tomorrowEnd)
          )
        },
        invoices: {
          where: eq(invoices.status, "UNPAID")
        },
        taxReturns: {
          where: eq(taxReturns.status, "ACTION_NEEDED")
        }
      }
    });

    let remindersSent = 0;

    for (const user of eligibleUsers) {
      let sent = false;

      // Priority 1: Appointments tomorrow
      if (user.appointments.length > 0) {
        await notifyUpcomingAppointmentReminder({
          email: user.email,
          phone: (user as any).profile?.phone || null,
          name: user.name || "Client",
          startTime: user.appointments[0].startTime,
        });
        sent = true;
      } 
      // Priority 2: Action Needed (Missing Docs)
      else if (user.taxReturns.length > 0) {
        await notifyActionNeededReminder({
          email: user.email,
          phone: (user as any).profile?.phone || null,
          name: user.name || "Client",
        });
        sent = true;
      }
      // Priority 3: Unpaid Invoices
      else if (user.invoices.length > 0) {
        // Find the oldest unpaid invoice
        const invoice = user.invoices[0];
        await notifyUnpaidInvoiceReminder({
          email: user.email,
          phone: (user as any).profile?.phone || null,
          name: user.name || "Client",
          amount: Number(invoice.amount),
          invoiceId: invoice.id,
        });
        sent = true;
      }

      if (sent) {
        await db.update(users)
          .set({ lastReminderAt: new Date() })
          .where(eq(users.id, user.id));
        remindersSent++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: eligibleUsers.length,
      remindersSent 
    });
  } catch (error: any) {
    console.error("Reminder Cron Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
