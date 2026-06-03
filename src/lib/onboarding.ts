import { db } from "@/lib/db";
import { users, taxReturns, appointments, auditLogs, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPortalInvitation, sendEmail } from "@/lib/notifications";
import { BookingDetails } from "@/lib/booking";

/**
 * Handles the onboarding of a new client after a booking event.
 */
export async function onboardBookingClient(details: BookingDetails) {
  const { clientEmail, clientName, startTime, endTime, id: bookingId, customFields } = details;

  // 1. Check if user already exists
  let user = await db.query.users.findFirst({
    where: eq(users.email, clientEmail.toLowerCase()),
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    // Create new user
    const [newUser] = await db.insert(users).values({
      email: clientEmail.toLowerCase(),
      name: clientName,
      role: "CLIENT",
    }).returning();
    user = newUser;

    // Create profile
    await db.insert(profiles).values({
      userId: user.id,
    });

    // Log user creation
    await db.insert(auditLogs).values({
      action: "AUTO_CREATE_USER_FROM_BOOKING",
      targetType: "USER",
      targetId: user.id,
      metadata: JSON.stringify({ bookingId }),
    });
  }

  // 2. Create or find Tax Return for the current year
  const currentYear = new Date().getFullYear();
  let taxReturn = await db.query.taxReturns.findFirst({
    where: (tr, { and, eq }) => and(eq(tr.clientId, user!.id), eq(tr.year, currentYear)),
  });

  if (!taxReturn) {
    const [newReturn] = await db.insert(taxReturns).values({
      clientId: user.id,
      year: currentYear,
      status: "NOT_STARTED",
    }).returning();
    taxReturn = newReturn;
  }

  // 3. Record the appointment
  let note = "";
  if (customFields && Object.keys(customFields).length > 0) {
    note = "Tax Situation / Booking Details:\n";
    for (const [key, value] of Object.entries(customFields)) {
      // Map known Question IDs to human-readable labels if necessary
      // For now, we use the key provided by Graph
      note += `- ${key}: ${value}\n`;
    }
  }

  await db.insert(appointments).values({
    userId: user.id,
    bookingId,
    startTime,
    endTime,
    location: details.location || "Remote / To be determined",
    notes: note,
    status: "SCHEDULED",
  });

  // 4. Handle invitation if new user
  if (isNewUser) {
    // Generate an invitation link (magic link or reset password)
    const invitationLink = `${process.env.NEXTAUTH_URL}/auth/setup?email=${encodeURIComponent(user.email)}&token=AUTO_GEN_${user.id}`;
    
    await notifyPortalInvitation({
      email: user.email,
      name: user.name || "Neighbor",
      invitationLink,
    });
  }

  // 5. Update tax return notes with same details for admin visibility
  if (note) {
    await db.update(taxReturns)
      .set({ notes: (taxReturn.notes ? taxReturn.notes + "\n\n" : "") + note })
      .where(eq(taxReturns.id, taxReturn.id));
  }

  // 6. Notify Admin about the new booking and details
  await sendEmail({
    to: process.env.ADMIN_EMAIL || "jsimpson@yourtaxsource.com",
    subject: `[New Booking] ${clientName} - ${details.serviceType}`,
    html: `
      <h2>New Appointment Scheduled</h2>
      <p><strong>Client:</strong> ${clientName} (${clientEmail})</p>
      <p><strong>Service:</strong> ${details.serviceType}</p>
      <p><strong>Time:</strong> ${startTime.toLocaleString()} - ${endTime.toLocaleString()}</p>
      <p><strong>Location:</strong> ${details.location || "Remote"}</p>
      <hr />
      <h3>Tax Situation / Custom Fields:</h3>
      <pre>${note || "None provided"}</pre>
      <p><a href="${process.env.NEXTAUTH_URL}/admin/returns/${taxReturn.id}">View Client Return</a></p>
    `
  });

  return { userId: user.id, returnId: taxReturn.id };
}
