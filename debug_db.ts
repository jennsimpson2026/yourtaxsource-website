import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/lib/db/schema";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });
  const db = drizzle(client, { schema });

  try {
    const categories = await db.select().from(schema.categories);
    console.log("Categories count:", categories.length);

    const users = await db.select().from(schema.users);
    console.log("Users:", JSON.stringify(users.map(u => ({ id: u.id, email: u.email, role: u.role })), null, 2));

    const returns = await db.select().from(schema.taxReturns);
    console.log("Tax Returns count:", returns.length);
    
    const updates = await db.select().from(schema.annualUpdates);
    console.log("Annual Updates count:", updates.length);

  } catch (e) {
    console.error("Error connecting to DB:", e);
  }
}

main();
