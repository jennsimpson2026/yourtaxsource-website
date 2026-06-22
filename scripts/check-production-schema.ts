import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

async function checkSchema() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    const result = await client.execute("PRAGMA table_info(posts)");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

checkSchema();
