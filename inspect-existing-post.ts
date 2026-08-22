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
    console.log("Post ID:", post.id);
    console.log("Title:", post.title);
    console.log("Raw Content (first 500 chars):");
    console.log(post.content?.toString().substring(0, 500));
    console.log("\nContains literal \\n?", post.content?.toString().includes('\\n'));

  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
