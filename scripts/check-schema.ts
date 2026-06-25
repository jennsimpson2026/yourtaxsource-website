import { createClient } from '@libsql/client';

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });
  const res = await client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='posts'");
  console.log(res.rows[0]?.sql);
}
run();
