import { serve } from "@upstash/workflow/nextjs";
import { sendEmailDirect, sendSMSDirect } from "@/lib/notifications";

export const { POST } = serve<{
  email?: string;
  phone?: string | null;
  subject?: string;
  html?: string;
  smsBody?: string;
}>(async (context) => {
  const { email, phone, subject, html, smsBody } = context.requestPayload;

  if (email && subject && html) {
    await context.run("send-email", async () => {
      return await sendEmailDirect({ to: email, subject, html });
    });
  }

  if (phone && smsBody) {
    await context.run("send-sms", async () => {
      return await sendSMSDirect({ to: phone, body: smsBody });
    });
  }
});
