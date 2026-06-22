import { createClient } from '@libsql/client';

async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });
  const res = await client.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
  console.log(res.rows[0]?.id);
}
run();
