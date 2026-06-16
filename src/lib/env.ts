import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),
  DATABASE_AUTH_TOKEN: z.string().optional(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),

  // AWS S3
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_S3_BUCKET: z.string().min(1).optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1).optional(),

  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  // Azure (M365 integration)
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AZURE_TENANT_ID: z.string().optional(),

  // Helcim
  HELCIM_ACCOUNT_ID: z.string().optional(),
  HELCIM_API_TOKEN: z.string().optional(),

  // QuickBooks Online
  QBO_CLIENT_ID: z.string().optional(),
  QBO_CLIENT_SECRET: z.string().optional(),
  QBO_REDIRECT_URI: z.string().optional(),
  QBO_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),

  // Upstash Workflow / QStash
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
  UPSTASH_WORKFLOW_URL: z.string().optional(),

  // Admin/Misc
  ADMIN_EMAIL: z.string().email(),
  CONTACT_FORM_RECIPIENT: z.string().email(),
  CRON_SECRET: z.string().min(1),
  ENCRYPTION_KEY: z.string().min(1).optional(),
});

export const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(env.error.format(), null, 2));
  if (process.env.NODE_ENV === "production" && process.env.SKIP_ENV_VALIDATION !== "true") {
    // throw new Error("Invalid environment variables. Please check your Vercel project settings.");
  }
}

export const validatedEnv = env.success ? env.data : (process.env as unknown as z.infer<typeof envSchema>);
// deployment trigger Tue Jun 16 19:59:16 UTC 2026
