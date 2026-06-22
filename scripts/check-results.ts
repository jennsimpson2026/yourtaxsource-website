
import { db } from "../src/lib/db";
import { users, profiles, taxReturns, engagementLetters, appointments, auditLogs, verificationTokens } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";

const email = "test-client-2026@example.com";

async function verify() {
  console.log(`Verifying data for ${email}...`);
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  
  if (!user) {
    console.error("User NOT found");
    return;
  }
  console.log("User found:", user.id);
  
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.userId, user.id),
  });
  console.log("Profile:", profile ? "Found" : "NOT found");
  
  const returns = await db.query.taxReturns.findMany({
    where: and(eq(taxReturns.clientId, user.id), eq(taxReturns.year, 2026)),
  });
  console.log("Tax Returns (2026):", returns.length);
  
  if (returns.length > 0) {
    const letter = await db.query.engagementLetters.findFirst({
      where: eq(engagementLetters.returnId, returns[0].id),
    });
    console.log("Engagement Letter:", letter ? "Found" : "NOT found");
  }
  
  const appts = await db.query.appointments.findMany({
    where: eq(appointments.userId, user.id),
  });
  console.log("Appointments:", appts.length);
  
  const tokenRecord = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.identifier, email),
  });
  console.log("Verification Token:", tokenRecord ? "Found" : "NOT found");
  if (tokenRecord) {
    console.log(`- Token: ${tokenRecord.token}`);
  }
  
  process.exit(0);
}

verify();
