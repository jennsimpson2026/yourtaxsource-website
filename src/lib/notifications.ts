import { Resend } from "resend";
import twilio from "twilio";
import { workflowClient } from "./workflow";
import { logger } from "./logger";

// Helper to get Resend instance lazily
let resendInstance: Resend | null = null;
function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_123") {
      if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
         console.warn("RESEND_API_KEY is not set, using mock during build");
         return { emails: { send: async () => ({ id: "mock" }) } } as any;
      }
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

// Helper to get Twilio client lazily
let twilioInstance: any = null;
function getTwilio() {
  if (!twilioInstance) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error("Twilio credentials not set");
    }
    twilioInstance = twilio(accountSid, authToken);
  }
  return twilioInstance;
}

/**
 * LOW-LEVEL: Sends email directly using Resend.
 * Use sendEmail() for background-aware sending.
 */
export async function sendEmailDirect({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Skipping email: RESEND_API_KEY not set");
    return;
  }
  try {
    const resend = getResend();
    const data = await resend.emails.send({
      from: "Your Tax Source <notifications@yourtaxsource.com>",
      to: [to],
      subject,
      html,
    });
    return data;
  } catch (error) {
    console.error("Email sending error:", error);
  }
}

/**
 * LOW-LEVEL: Sends SMS directly using Twilio.
 * Use sendSMS() for background-aware sending.
 */
export async function sendSMSDirect({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("Skipping SMS: Twilio credentials not set");
    return;
  }
  try {
    const twilioClient = getTwilio();
    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return message;
  } catch (error) {
    console.error("SMS sending error:", error);
  }
}

/**
 * Triggers a background workflow for notifications.
 * Falls back to synchronous execution if Upstash is not configured.
 */
async function triggerNotificationWorkflow(payload: {
  email?: string;
  phone?: string | null;
  subject?: string;
  html?: string;
  smsBody?: string;
  name: string;
}) {
  const isUpstashConfigured = !!process.env.QSTASH_TOKEN;
  
  if (isUpstashConfigured) {
    try {
      await workflowClient.trigger({
        url: `${process.env.NEXTAUTH_URL}/api/workflow/notifications`,
        body: payload,
      });
      console.log(`[Notifications] Offloaded ${payload.name} to background workflow`);
      return;
    } catch (error) {
      console.error(`[Notifications] Failed to trigger workflow for ${payload.name}:`, error);
      logger.error(`[Notifications] Failed to trigger workflow for ${payload.name}`, { error, payload });
      // Fallback to sync
    }
  }

  // Fallback: Synchronous execution using Direct methods to avoid loop
  logger.info(`[Notifications] Falling back to synchronous execution for ${payload.name}`, { payload });
  if (payload.email && payload.subject && payload.html) {
    await sendEmailDirect({ to: payload.email, subject: payload.subject, html: payload.html });
  }
  if (payload.phone && payload.smsBody) {
    await sendSMSDirect({ to: payload.phone, body: payload.smsBody });
  }
}

/**
 * Public API: Sends email, backgrounded if possible.
 */
export async function sendEmail(args: { to: string, subject: string, html: string }) {
  return await triggerNotificationWorkflow({
    email: args.to,
    subject: args.subject,
    html: args.html,
    name: "Generic Email"
  });
}

/**
 * Public API: Sends SMS, backgrounded if possible.
 */
export async function sendSMS(args: { to: string, body: string }) {
  return await triggerNotificationWorkflow({
    phone: args.to,
    smsBody: args.body,
    name: "Generic SMS"
  });
}

export async function notifyStatusUpdate(email: string, phone: string | null, status: string) {
  const subject = "Tax Return Status Updated";
  const body = `Your tax return status has been updated to: ${status}. Log in to the portal to see more details.`;
  
  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html: `<p>${body}</p>`,
    smsBody: body,
    name: "Status Update"
  });
}

export async function notifyDocumentStatusUpdate(email: string, phone: string | null, fileName: string, status: string, feedback?: string) {
  const subject = `Document ${status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()} - Your Tax Source`;
  let body = `Your document "${fileName}" has been ${status.toLowerCase().replace("_", " ")}.`;
  if (feedback) {
    body += `\n\nFeedback: ${feedback}`;
  }
  body += `\n\nLog in to your portal to view more details.`;

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Document Status Updated</h2>
      <p>Hi there,</p>
      <p>The status of your uploaded document has been updated:</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <strong>Document:</strong> ${fileName}<br>
        <strong>Status:</strong> ${status.toLowerCase().replace("_", " ")}
        ${feedback ? `<br><strong>Feedback:</strong> ${feedback}` : ""}
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/portal/documents" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in Portal</a>
      </div>
      <p>Thank you!</p>
    </div>`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html,
    smsBody: body,
    name: "Document Status Update"
  });
}

export async function notifyPaymentReceived(email: string, phone: string | null, amount: number) {
  const subject = "Payment Confirmed";
  const body = `We have received your payment of $${amount}. Thank you!`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html: `<p>${body}</p>`,
    smsBody: body,
    name: "Payment Received"
  });
}

export async function notifyAdminPaymentReceived({
  clientName,
  amount,
  method,
  invoiceReference,
}: {
  clientName: string;
  amount: number;
  method: string;
  invoiceReference: string;
}) {
  const recipient = process.env.ADMIN_EMAIL || "jsimpson@yourtaxsource.com";
  const subject = `[Payment Received] ${clientName} - $${amount}`;
  const now = new Date().toLocaleString("en-US", { timeZone: "America/New_York" });

  const html = `
    <h2>Payment Received</h2>
    <p><strong>Client:</strong> ${clientName}</p>
    <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
    <p><strong>Method:</strong> ${method}</p>
    <p><strong>Date/Time:</strong> ${now} (EST)</p>
    <p><strong>Reference:</strong> ${invoiceReference}</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin">View in Admin Dashboard</a></p>
  `;

  await triggerNotificationWorkflow({
    email: recipient,
    subject,
    html,
    name: "Admin Payment Received"
  });
}

export async function notifyDocumentRequest(email: string, phone: string | null, documentList: string) {
  const subject = "Action Needed: Documents Requested for Your Tax Return";
  const body = `We need additional documentation to proceed with your tax return: ${documentList}. Please upload these to your secure client portal.`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html: `<p>${body}</p><p><a href="${process.env.NEXTAUTH_URL}/portal/documents">Upload Documents</a></p>`,
    smsBody: body,
    name: "Document Request"
  });
}

export async function notifyDocumentUpload(staffEmail: string, clientName: string, documentName: string) {
  const subject = `[Portal] New Document Uploaded - ${clientName}`;
  const html = `
    <p>A new document has been uploaded to the portal.</p>
    <p><strong>Client:</strong> ${clientName}</p>
    <p><strong>Document:</strong> ${documentName}</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin">View in Admin Dashboard</a></p>
  `;

  await triggerNotificationWorkflow({
    email: staffEmail,
    subject,
    html,
    name: "Document Upload Notification"
  });
}

export async function notifyPortalInvitation({
  email,
  name,
  invitationLink,
}: {
  email: string;
  name: string;
  invitationLink: string;
}) {
  const subject = "Welcome to Your Tax Source - Action Required";
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Welcome to Your Tax Source!</h2>
      <p>Hi ${name || "there"},</p>
      <p>Thank you for booking your tax appointment with us. We've created a secure client portal account for you to make document sharing and communication easy and safe.</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0; color: #111827;">Appointment Instructions</h3>
        <p style="margin-bottom: 5px;"><strong>In-Person:</strong> We look forward to seeing you at 100 1/2 S Main St, Belmont, NC 28012.</p>
        <p style="margin-bottom: 0;"><strong>Remote:</strong> You will receive a meeting link via email. Please ensure all tax documents are uploaded to your portal at least 24 hours before our scheduled time.</p>
      </div>

      <p>To get started, please click the button below to set up your password and access your portal:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${invitationLink}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Set Up Your Account</a>
      </div>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${invitationLink}</p>
      <p>We look forward to working with you!</p>
      <p>Best regards,<br>The Your Tax Source Team</p>
    </div>`;

  return await triggerNotificationWorkflow({
    email,
    subject,
    html,
    name: "Portal Invitation"
  });
}

export async function notifyAppointmentScheduled({
  email,
  name,
  startTime,
  location,
}: {
  email: string;
  name: string;
  startTime: Date;
  location: string;
}) {
  const subject = "Appointment Confirmation - Your Tax Source";
  const dateStr = startTime.toLocaleString("en-US", { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Appointment Confirmed</h2>
      <p>Hi ${name || "there"},</p>
      <p>Your appointment with Your Tax Source has been scheduled successfully.</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="margin-top: 0;"><strong>Time:</strong> ${dateStr}</p>
        <p><strong>Location:</strong> ${location}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 15px 0;" />
        <h3 style="margin-top: 0; color: #111827;">Instructions</h3>
        <p style="margin-bottom: 5px;"><strong>In-Person:</strong> 100 1/2 S Main St, Belmont, NC 28012.</p>
        <p style="margin-bottom: 0;"><strong>Remote:</strong> You will receive a meeting link via email. Please ensure all tax documents are uploaded to your portal at least 24 hours before our scheduled time.</p>
      </div>

      <p><a href="${process.env.NEXTAUTH_URL}/portal" style="color: #6d28d9; font-weight: bold;">Log in to your portal</a> to manage documents and view status.</p>
      <p>Best regards,<br>The Your Tax Source Team</p>
    </div>`;

  return await triggerNotificationWorkflow({
    email,
    subject,
    html,
    name: "Appointment Confirmation"
  });
}

export async function notifyUpcomingAppointmentReminder({
  email,
  phone,
  name,
  startTime,
}: {
  email: string;
  phone: string | null;
  name: string;
  startTime: Date;
}) {
  const dateStr = startTime.toLocaleString("en-US", { 
    weekday: 'long', 
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const subject = "Reminder: Your Tax Appointment is Tomorrow";
  const body = "Hi " + (name || "there") + ", this is a reminder that you have an appointment with Your Tax Source scheduled for tomorrow at " + dateStr + ". Please ensure all requested documents are uploaded to your portal.";

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Upcoming Appointment Reminder</h2>
      <p>Hi ${name || "there"},</p>
      <p>This is a friendly reminder of your upcoming tax appointment:</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <strong>Time:</strong> ${dateStr}
      </div>
      <p>Please ensure you have uploaded all necessary tax documents to your portal at least 24 hours before our meeting.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/portal" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access Your Portal</a>
      </div>
      <p>We look forward to seeing you!</p>
    </div>`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html,
    smsBody: body,
    name: "Appointment Reminder"
  });
}

export async function notifyUnpaidInvoiceReminder({
  email,
  phone,
  name,
  amount,
  invoiceId,
}: {
  email: string;
  phone: string | null;
  name: string;
  amount: number;
  invoiceId: string;
}) {
  const subject = "Reminder: Unpaid Invoice from Your Tax Source";
  const body = "Hi " + (name || "there") + ", this is a reminder regarding your unpaid invoice for $" + amount.toFixed(2) + ". You can pay securely through your client portal.";

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Payment Reminder</h2>
      <p>Hi ${name || "there"},</p>
      <p>This is a friendly reminder that you have an outstanding invoice for your tax services:</p>
      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <strong>Invoice:</strong> #${invoiceId.slice(0, 8)}<br>
        <strong>Amount Due:</strong> &#36;${amount.toFixed(2)}
      </div>
      <p>You can view and pay your invoice securely by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/portal#invoices" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Pay Invoice</a>
      </div>
      <p>Thank you for your business!</p>
    </div>`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html,
    smsBody: body,
    name: "Invoice Reminder"
  });
}

export async function notifyActionNeededReminder({
  email,
  phone,
  name,
}: {
  email: string;
  phone: string | null;
  name: string;
}) {
  const subject = "Action Required: Your Tax Return Status";
  const body = "Hi " + (name || "there") + ", your tax return is currently on hold awaiting your action (missing documents or info). Please log in to your portal to see what's needed.";

  const html = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #6d28d9;">Action Needed</h2>
      <p>Hi ${name || "there"},</p>
      <p>We are currently working on your tax return, but we need some additional information or documents from you to proceed.</p>
      <p>Please log in to your secure portal to view the open requests and upload any missing items.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXTAUTH_URL}/portal" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Portal</a>
      </div>
      <p>Thank you!</p>
    </div>`;

  await triggerNotificationWorkflow({
    email,
    phone,
    subject,
    html,
    smsBody: body,
    name: "Action Needed Reminder"
  });
}

export async function notifyContactFormSubmission({
  firstName,
  lastName,
  email,
  subject: inquirySubject,
  message,
}: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) {
  const recipient = process.env.CONTACT_FORM_RECIPIENT || "jsimpson@yourtaxsource.com";
  const defaultSubject = `[Website Inquiry] New Message from ${firstName} ${lastName}`;
  const subject = process.env.CONTACT_FORM_SUBJECT || defaultSubject;

  const html = `
    <h2>New Website Inquiry</h2>
    <p><strong>From:</strong> ${firstName} ${lastName} (${email})</p>
    <p><strong>Subject:</strong> ${inquirySubject}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `;

  await triggerNotificationWorkflow({
    email: recipient,
    subject,
    html,
    name: "Contact Form Submission"
  });
}

export async function notifyNewMessage({
  toEmail,
  toPhone,
  senderName,
  content,
  isToStaff = false,
}: {
  toEmail: string;
  toPhone: string | null;
  senderName: string;
  content: string;
  isToStaff?: boolean;
}) {
  const subject = `[Portal] New Message from ${senderName}`;
  const portalUrl = isToStaff ? `${process.env.NEXTAUTH_URL}/admin` : `${process.env.NEXTAUTH_URL}/portal/messages`;
  const body = `You have a new message from ${senderName}. Log in to the portal to view and respond.`;

  const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6d28d9;">New Message</h2>
        <p>Hi,</p>
        <p>You have received a new message in the Your Tax Source portal:</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; font-style: italic;">
          "${content.length > 100 ? content.substring(0, 100) + "..." : content}"
        </div>
        <p>Log in to view the full message and respond:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${portalUrl}" style="background-color: #6d28d9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Message</a>
        </div>
      </div>`;

  await triggerNotificationWorkflow({
    email: toEmail,
    phone: toPhone,
    subject,
    html,
    smsBody: body,
    name: "New Message Notification"
  });
}
