import { createClient } from '@libsql/client';

async function audit() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  console.log("--- Categories ---");
  const categories = await client.execute("SELECT id, name, slug FROM categories");
  console.log(JSON.stringify(categories.rows, null, 2));

  console.log("\n--- Posts (Resources) ---");
  const posts = await client.execute("SELECT id, title, category_id, type, featured_image_url FROM posts WHERE status = 'published'");
  console.log(JSON.stringify(posts.rows, null, 2));
}

audit();
