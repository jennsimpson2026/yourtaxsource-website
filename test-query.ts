import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/lib/db/schema";
import { eq, desc } from "drizzle-orm";

async function test() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  try {
    console.log("Attempting to query taxReturns...");
    const userId = "some-user-id"; // Doesn't matter for schema check
    
    // We'll use the raw SQL to see what it generates
    const query = db.select().from(schema.taxReturns).toSQL();
    console.log("Generated SQL:", query.sql);

    const returns = await db.query.taxReturns.findMany({
      orderBy: [desc(schema.taxReturns.year)],
      limit: 1,
    });
    console.log("Query successful!", returns.length, "returns found.");
  } catch (error: any) {
    console.error("Query failed!");
    console.error(error);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
  }
}

test();
