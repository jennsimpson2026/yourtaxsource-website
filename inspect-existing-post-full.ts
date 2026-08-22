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
    const slug = 'tax-season-starts-before-tax-season';
    const result = await client.execute({
      sql: "SELECT id, title, content FROM posts WHERE slug = ?",
      args: [slug]
    });
    
    if (result.rows.length === 0) {
      console.log("Post not found.");
      return;
    }

    const post = result.rows[0];
    console.log("Post Content (Full):");
    console.log("---CONTENT START---");
    console.log(post.content?.toString());
    console.log("---CONTENT END---");

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
