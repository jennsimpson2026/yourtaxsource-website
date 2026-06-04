import { Resend } from "resend";
import twilio from "twilio";

// Helper to get Resend instance lazily
let resendInstance: Resend | null = null;
function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_123") {
      // Return a dummy instance or throw a better error for build time
      if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
         // Allow build to proceed if we are just building and don't have keys yet
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

export async function sendEmail({
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
    // Don't throw, just log for now to prevent breaking flows
  }
}

export async function sendSMS({
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
    // Don't throw
  }
}

export async function notifyStatusUpdate(email: string, phone: string | null, status: string) {
  const subject = "Tax Return Status Updated";
  const body = `Your tax return status has been updated to: ${status}. Log in to the portal to see more details.`;
  
  await sendEmail({
    to: email,
    subject,
    html: `<p>${body}</p>`,
  });

  if (phone) {
    await sendSMS({
      to: phone,
      body,
    });
  }
}

export async function notifyPaymentReceived(email: string, phone: string | null, amount: number) {
  const subject = "Payment Confirmed";
  const body = `We have received your payment of $${amount}. Thank you!`;

  await sendEmail({
    to: email,
    subject,
    html: `<p>${body}</p>`,
  });

  if (phone) {
    await sendSMS({
      to: phone,
      body,
    });
  }
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

  await sendEmail({
    to: recipient,
    subject,
    html,
  });
}

export async function notifyDocumentRequest(email: string, phone: string | null, documentList: string) {
  const subject = "Action Needed: Documents Requested for Your Tax Return";
  const body = `We need additional documentation to proceed with your tax return: ${documentList}. Please upload these to your secure client portal.`;

  await sendEmail({
    to: email,
    subject,
    html: `<p>${body}</p><p><a href="${process.env.NEXTAUTH_URL}/portal/documents">Upload Documents</a></p>`,
  });

  if (phone) {
    await sendSMS({
      to: phone,
      body,
    });
  }
}

export async function notifyDocumentUpload(staffEmail: string, clientName: string, documentName: string) {
  const subject = `[Portal] New Document Uploaded - ${clientName}`;
  const html = `
    <p>A new document has been uploaded to the portal.</p>
    <p><strong>Client:</strong> ${clientName}</p>
    <p><strong>Document:</strong> ${documentName}</p>
    <p><a href="${process.env.NEXTAUTH_URL}/admin">View in Admin Dashboard</a></p>
  `;

  await sendEmail({
    to: staffEmail,
    subject,
    html,
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
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
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
    </div>
  `;

  return await sendEmail({
    to: email,
    subject,
    html,
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

  const result = await sendEmail({
    to: recipient,
    subject,
    html,
  });

  if (!result && process.env.RESEND_API_KEY) {
    throw new Error("Failed to send email notification");
  }
}
