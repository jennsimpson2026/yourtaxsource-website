import { createClient } from "@libsql/client";

async function test() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log("Checking __drizzle_migrations in production DB...");
    const result = await client.execute("SELECT * FROM __drizzle_migrations");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Failed to check migrations!", error);
  }
}

test();
