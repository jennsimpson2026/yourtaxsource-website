import { createClient } from "@libsql/client";

async function test() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log("--- MIGRATIONS START ---");
    const result = await client.execute("SELECT * FROM __drizzle_migrations");
    for (const row of result.rows) {
      console.log(JSON.stringify(row));
    }
    console.log("--- MIGRATIONS END ---");
  } catch (error) {
    console.error("Failed to check migrations!", error);
  }
}

test();
