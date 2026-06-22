import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

async function checkDb() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

  console.log("Using URL:", process.env.DATABASE_URL);

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const categories = await client.execute("SELECT * FROM categories");
  console.log("Categories:", JSON.stringify(categories.rows, null, 2));

  const posts = await client.execute("SELECT id, title, slug, category_id FROM posts WHERE status = 'published'");
  console.log("Posts:", JSON.stringify(posts.rows, null, 2));
}

checkDb();
