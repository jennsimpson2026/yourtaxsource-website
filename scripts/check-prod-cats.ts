import { createClient } from '@libsql/client';

async function check() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  const res = await client.execute("SELECT id, name, slug FROM categories");
  console.log("Production Categories:", JSON.stringify(res.rows, null, 2));
}

check().catch(console.error);
