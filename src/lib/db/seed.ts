import { db } from "./index";
import { users, categories } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const adminPassword = await bcrypt.hash("StagingAdmin123!", 10);
  const clientPassword = await bcrypt.hash("StagingClient123!", 10);

  // Create Admin (Jenn)
  await db.insert(users).values({
    email: "jsimpson@yourtaxsource.com",
    name: "Jennifer Simpson",
    password: adminPassword,
    role: "ADMIN",
    mfaEnabled: false,
  }).onConflictDoNothing();

  // Create Test Client
  await db.insert(users).values({
    email: "client@example.com",
    name: "Test Client",
    password: clientPassword,
    role: "CLIENT",
    mfaEnabled: false,
  }).onConflictDoNothing();

  // Seed Categories
  const blogCategories = [
    { name: "Tax Tips", slug: "tax-tips" },
    { name: "Small Business", slug: "small-business" },
    { name: "Real Estate", slug: "real-estate" },
    { name: "Financial Leadership", slug: "financial-leadership" },
  ];

  for (const category of blogCategories) {
    await db.insert(categories).values(category).onConflictDoNothing();
  }

  console.log("Seeding complete.");
}

seed().catch(console.error);
