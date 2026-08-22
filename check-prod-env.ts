import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  try {
    const result = await client.execute("SELECT id, name FROM categories LIMIT 5");
    console.log(JSON.stringify(result.rows, null, 2));
    const result2 = await client.execute("SELECT id, name FROM users WHERE role = 'ADMIN' LIMIT 5");
    console.log(JSON.stringify(result2.rows, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
