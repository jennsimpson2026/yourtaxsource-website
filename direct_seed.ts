import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://yourtaxsource-jsimpson.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODA5NjIwMzMsImlhdCI6MTc4MDM1NzIzMywiaWQiOiIwMTllNmI0OC02MjAxLTdmMGYtODJmYi1hYWMxNWM1MDYwYjQiLCJyaWQiOiI2ZTUyMWVmNy1lZDg0LTQ2NmItODAwOC05NzA3ZTI4ZTRhZDEifQ.3D2yF6w-egqU2sx85vG1tw8ZPnnZVN3CdIdgKsGyDWVX8CQuM9EEhLiAsW_uoCLF8laYPxBYGEeN9HzNl3zkAQ",
});

async function main() {
  const adminEmail = "jsimpson@yourtaxsource.com";
  const adminName = "Jenn Simpson";
  const adminRole = "ADMIN";
  // Hashed password for 'StagingAdmin123!'
  const adminPassword = "$2b$10$rsg/T2lQ6vYphOxr2vIs.OKgPKFsXfAia3KwDRHn.GFp1rYbWGAyS";

  try {
    await client.execute({
      sql: 'INSERT INTO users (id, email, name, role, password, mfa_enabled, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, strftime("%s", "now"), strftime("%s", "now")) ON CONFLICT(email) DO UPDATE SET role = "ADMIN"',
      args: [crypto.randomUUID(), adminEmail, adminName, adminRole, adminPassword, 0],
    });
    console.log("Admin user seeded/updated successfully.");
  } catch (error) {
    console.error("Seeding error:", error);
  }
}

main();
