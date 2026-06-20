import { createClient } from "@libsql/client";

async function check() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const res = await client.execute("SELECT id, status, payment_status, tax_prep_fee FROM tax_returns");
  console.log(JSON.stringify(res.rows, null, 2));
}

check();
