import { db } from "@/lib/db";
import { users, taxReturns, appointments, auditLogs, profiles, verificationTokens, engagementLetters } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notifyPortalInvitation, notifyAppointmentScheduled, sendEmail } from "@/lib/notifications";
import { BookingDetails } from "@/lib/booking";
import crypto from "crypto";

export const DEFAULT_ENGAGEMENT_LETTER_CONTENT = `
YOUR TAX SOURCE
Tax Preparation Engagement Agreement

This Engagement Agreement ("Agreement") is entered into between Your Tax Source ("Firm") and the undersigned client ("Client").

Purpose of Engagement

The purpose of this Agreement is to confirm our understanding of the services we will provide and to outline the responsibilities of both parties.

Your Tax Source agrees to prepare the Client's federal and applicable state income tax returns based solely upon information and documentation provided by the Client.

Our Responsibilities

Your Tax Source will:

- Prepare federal and applicable state tax returns for the tax year selected by the Client.
- Electronically file eligible returns once all required signatures and authorizations have been received.
- Exercise due professional care in preparing returns.
- Maintain confidentiality of Client information in accordance with applicable laws and regulations.
- Provide access to documents through our secure client portal.

Client Responsibilities

The Client agrees to:

- Provide complete, accurate, and timely information necessary to prepare tax returns.
- Review all completed returns prior to filing.
- Notify Your Tax Source of any errors, omissions, or changes before filing.
- Maintain supporting documentation for income, deductions, credits, and other tax positions taken on the return.
- Respond promptly to requests for additional information.

The Client understands that they are ultimately responsible for the accuracy of information reported on their tax returns.

Document Submission

The Client agrees to submit tax documents through the secure client portal whenever possible.

While email communication may be used for general correspondence, sensitive tax documents should not be transmitted through unsecured methods.

Electronic Signatures & Electronic Filing

The Client consents to:

- Electronic delivery of documents.
- Electronic signatures.
- Electronic filing of tax returns where permitted.

Electronic signatures shall carry the same legal effect as handwritten signatures.

Tax Positions & Accuracy

Your Tax Source will rely upon information provided by the Client without independently verifying its accuracy.

If we identify information that appears incomplete, inconsistent, or questionable, we may request additional clarification or documentation.

We reserve the right to withdraw from the engagement if sufficient information is not provided.

Fees & Payment

Preparation fees vary based on complexity and services required.

Payment is due upon completion of services unless alternative arrangements have been made in writing.

Your Tax Source reserves the right to withhold final copies of returns until outstanding balances have been satisfied.

Audit & Examination Services

This engagement does not include representation before the Internal Revenue Service, state taxing authorities, or any governmental agency.

If examination, audit, or representation services become necessary, a separate engagement agreement may be required.

Refunds

The Client acknowledges that:

- Tax refunds are issued solely by the taxing authority.
- Your Tax Source cannot guarantee refund amounts or processing timelines.
- Refund delays caused by government agencies are outside of our control.

Limitation of Liability

To the fullest extent permitted by law, Your Tax Source's liability arising from this engagement shall be limited to the amount of fees paid for the services giving rise to the claim.

Under no circumstances shall Your Tax Source be liable for consequential, incidental, indirect, or punitive damages.

Record Retention

Your Tax Source will retain electronic copies of prepared returns and supporting workpapers according to our record retention policies.

Clients are encouraged to maintain their own permanent copies of all tax documents.

Consent to Portal Communication

The Client authorizes Your Tax Source to:

- Deliver tax returns
- Deliver invoices
- Request documentation
- Send engagement letters
- Provide status updates

through the secure client portal and associated electronic communication systems.

Authorization

By signing below, I acknowledge that I have read and understand this Engagement Agreement and agree to its terms.

I certify that all information I provide to Your Tax Source will be complete and accurate to the best of my knowledge.
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
      note += `- ${key}: ${value}\n`;
    }
  }

  // Determine if virtual or in-person
  const isVirtual = details.onlineMeetingUrl || 
                    details.location?.toLowerCase().includes("virtual") || 
                    details.location?.toLowerCase().includes("teams") ||
                    note.toLowerCase().includes("virtual") ||
                    note.toLowerCase().includes("teams");

  const officeAddress = "100 1/2 S Main St, Belmont, NC 28012";
  const finalLocation = isVirtual 
    ? (details.onlineMeetingUrl || "Microsoft Teams (link in email)") 
    : officeAddress;

  await db.insert(appointments).values({
    userId: user.id,
    bookingId,
    startTime,
    endTime,
    location: finalLocation,
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
  } else {
    // Send appointment confirmation to existing users
    await notifyAppointmentScheduled({
      email: user.email,
      name: user.name || "Neighbor",
      startTime,
      location: finalLocation,
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
      <p><strong>Type:</strong> ${isVirtual ? "Virtual (Teams)" : "In-Person (Belmont Office)"}</p>
      <p><strong>Location/Link:</strong> ${finalLocation}</p>
      <hr />
      <h3>Tax Situation / Custom Fields:</h3>
      <pre>${note || "None provided"}</pre>
      <p><a href="${process.env.NEXTAUTH_URL}/admin/returns/${taxReturn.id}">View Client Return</a></p>
    `
  });

  return { userId: user.id, returnId: taxReturn.id };
}
