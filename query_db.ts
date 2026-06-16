import { createClient } from "@libsql/client";
async function run() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });
  try {
    const rs = await client.execute("SELECT * FROM users");
    console.log(JSON.stringify(rs.rows, null, 2));
  } catch (e) {
    console.error(e);
  }
}
run();
