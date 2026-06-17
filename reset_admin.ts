import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

const client = createClient({
  url: "libsql://yourtaxsource-jsimpson.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODA5NjIwMzMsImlhdCI6MTc4MDM1NzIzMywiaWQiOiIwMTllNmI0OC02MjAxLTdmMGYtODJmYi1hYWMxNWM1MDYwYjQiLCJyaWQiOiI2ZTUyMWVmNy1lZDg0LTQ2NmItODAwOC05NzA3ZTI4ZTRhZDEifQ.3D2yF6w-egqU2sx85vG1tw8ZPnnZVN3CdIdgKsGyDWVX8CQuM9EEhLiAsW_uoCLF8laYPxBYGEeN9HzNl3zkAQ",
});

async function main() {
  const email = "jsimpson@yourtaxsource.com";
  const tempPassword = "TaxSource2026!";
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  try {
    await client.execute({
      sql: "UPDATE users SET password = ?, role = 'ADMIN', mfa_enabled = 0 WHERE email = ?",
      args: [hashedPassword, email],
    });
    console.log(`Password reset for ${email} to: ${tempPassword}`);
    console.log("MFA has been disabled for this user to allow initial access.");
  } catch (error) {
    console.error("Reset error:", error);
  }
}

main();
