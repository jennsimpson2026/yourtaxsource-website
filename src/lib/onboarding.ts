import { db } from "@/lib/db";
import { users, taxReturns, appointments, auditLogs, profiles, verificationTokens, engagementLetters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPortalInvitation, sendEmail } from "@/lib/notifications";
import { BookingDetails } from "@/lib/booking";
import crypto from "crypto";

const OFFICE_ADDRESS = "100 1/2 S Main St, Belmont, NC 28012";

const DEFAULT_ENGAGEMENT_LETTER_CONTENT = `
Dear Neighbor,

This letter is to confirm and specify the terms of our engagement with you and to clarify the nature and extent of the services we will provide. In order to ensure an understanding of our mutual responsibilities, we ask all clients for whom returns are prepared to confirm the following arrangements.

We will prepare your 2024 federal and requested state individual income tax returns from information which you will furnish to us. We will not audit or otherwise verify the data you submit, although it may be necessary to ask you for clarification of some of the information. We will furnish you with questionnaires and/or organizers to guide you in gathering the necessary information.

It is your responsibility to provide all the information required for the preparation of complete and accurate returns. You should retain all the documents, canceled checks and other data that form the basis of income and deductions. These may be necessary to prove the accuracy and completeness of the returns to a taxing authority. You have the final responsibility for the income tax returns and, therefore, you should review them carefully before you sign them.

Our work in connection with the preparation of your income tax returns does not include any procedures designed to discover defalcations or other irregularities, should any exist.

Fees & Payment
Our fee for these services will be based upon the complexity of the return and the time required at our standard billing rates. All invoices are due and payable upon completion of the tax return and before the return is electronically filed.
`;

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

    // Create default Engagement Letter for new returns
    await db.insert(engagementLetters).values({
      returnId: taxReturn.id,
      content: DEFAULT_ENGAGEMENT_LETTER_CONTENT,
      status: "PENDING",
    });
  } else {
    // Ensure an engagement letter exists even for existing returns
    const existingLetter = await db.query.engagementLetters.findFirst({
      where: eq(engagementLetters.returnId, taxReturn.id),
    });

    if (!existingLetter) {
      await db.insert(engagementLetters).values({
        returnId: taxReturn.id,
        content: DEFAULT_ENGAGEMENT_LETTER_CONTENT,
        status: "PENDING",
      });
    }
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

  // Detect if virtual based on location or custom fields or onlineMeetingUrl
  let isVirtual = !!details.onlineMeetingUrl || 
                   details.location?.toLowerCase().includes("virtual") || 
                   details.location?.toLowerCase().includes("teams");

  if (!isVirtual && customFields) {
    for (const value of Object.values(customFields)) {
      if (typeof value === 'string') {
        const lowerVal = value.toLowerCase();
        if (lowerVal.includes("virtual") || lowerVal.includes("teams")) {
          isVirtual = true;
          break;
        }
      }
    }
  }

  const meetingLocation = isVirtual 
    ? (details.onlineMeetingUrl || "Virtual (Teams link to be provided)") 
    : OFFICE_ADDRESS;

  await db.insert(appointments).values({
    userId: user.id,
    bookingId,
    startTime,
    endTime,
    location: meetingLocation,
    notes: note,
    status: "SCHEDULED",
  });

  // 4. Handle invitation if new user
  if (isNewUser) {
    // Generate an invitation token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db.insert(verificationTokens).values({
      identifier: user.email,
      token,
      expires,
    });

    const invitationLink = `${process.env.NEXTAUTH_URL}/auth/setup?email=${encodeURIComponent(user.email)}&token=${token}`;
    
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
      <p><strong>Type:</strong> ${isVirtual ? "Virtual (Teams)" : "In-Person"}</p>
      <p><strong>Location:</strong> ${meetingLocation}</p>
      <hr />
      <h3>Tax Situation / Custom Fields:</h3>
      <pre>${note || "None provided"}</pre>
      <p><a href="${process.env.NEXTAUTH_URL}/admin/returns/${taxReturn.id}">View Client Return</a></p>
    `
  });

  return { userId: user.id, returnId: taxReturn.id };
}
