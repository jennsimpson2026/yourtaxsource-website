import { db } from "./index";
import { users } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("StagingAdmin123!", 10);
  const clientPassword = await bcrypt.hash("StagingClient123!", 10);

  // Create Admin
  await db.insert(users).values({
    email: "admin@yourtaxsource.com",
    name: "Admin User",
    password: adminPassword,
    role: "ADMIN",
    mfaEnabled: false,
  }).onConflictDoNothing();

  // Create Client
  await db.insert(users).values({
    email: "client@example.com",
    name: "Test Client",
    password: clientPassword,
    role: "CLIENT",
    mfaEnabled: false,
  }).onConflictDoNothing();

  console.log("Seeding complete.");
}

seed().catch(console.error);
