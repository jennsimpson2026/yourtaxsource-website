import { createClient } from '@libsql/client';

async function check() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  const res = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables in Production:", res.rows.map(r => r.name));
}

check().catch(console.error);
