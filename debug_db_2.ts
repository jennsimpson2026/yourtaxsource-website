import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/lib/db/schema";
import fs from "fs";

async function main() {
  const envLocal = fs.readFileSync(".env.local", "utf8");
  const env: Record<string, string> = {};
  envLocal.split("\n").forEach(line => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      env[key.trim()] = rest.join("=").trim().replace(/^"(.*)"$/, "$1");
    }
  });

  const client = createClient({
    url: env.DATABASE_URL!,
    authToken: env.DATABASE_AUTH_TOKEN,
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
