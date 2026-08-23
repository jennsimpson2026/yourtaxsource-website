import { createClient } from '@libsql/client';

async function check() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  const res = await client.execute("SELECT id, title, featured_image_url FROM posts WHERE title LIKE '%1040%'");
  console.log("Production 1040s:", JSON.stringify(res.rows, null, 2));
}

check().catch(console.error);
