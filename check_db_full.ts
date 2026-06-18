import { db } from "./src/lib/db";
import { users, appointments, engagementLetters, verificationTokens, taxReturns } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const email = "e2e_test_client@yourtaxsource.com";
  
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  console.log("User:", JSON.stringify(user, null, 2));

  if (user) {
    const apps = await db.query.appointments.findMany({
      where: eq(appointments.userId, user.id),
    });
    console.log("Appointments:", JSON.stringify(apps, null, 2));

    const returns = await db.query.taxReturns.findMany({
      where: eq(taxReturns.clientId, user.id),
    });
    console.log("Tax Returns:", JSON.stringify(returns, null, 2));

    if (returns.length > 0) {
      const letters = await db.query.engagementLetters.findMany({
        where: eq(engagementLetters.returnId, returns[0].id),
      });
      console.log("Engagement Letters:", JSON.stringify(letters, null, 2));
    }
  }

  const tokens = await db.query.verificationTokens.findMany({
    where: eq(verificationTokens.identifier, email),
  });
  console.log("Verification Tokens:", JSON.stringify(tokens, null, 2));
}

main().catch(console.error);
