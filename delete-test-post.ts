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
    const slug = 'markdown-rendering-verification';
    const result = await client.execute({
      sql: "DELETE FROM posts WHERE slug = ?",
      args: [slug]
    });
    console.log("Deleted test post. Rows affected:", result.rowsAffected);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
