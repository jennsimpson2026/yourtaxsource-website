"use server";

import { notifyContactFormSubmission } from "@/lib/notifications";
import { contactFormLimiter } from "@/lib/ratelimit";
import { headers } from "next/headers";
import { z } from "zod";
import { logger } from "@/lib/logger";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export async function submitContactForm(formData: FormData) {
  // Rate limiting
  const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await contactFormLimiter.limit(ip);
  if (!success) {
    return { error: "Too many messages. Please try again in a minute." };
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  const validated = contactSchema.safeParse(rawData);

  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  try {
    await notifyContactFormSubmission(validated.data);
    return { success: true };
  } catch (error) {
    logger.error("Contact form error", { error, data: validated.data });
    return { error: "Something went wrong. Please try again later." };
  }
}
