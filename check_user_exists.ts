import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  try {
    const result = await client.execute("SELECT id, email, role, mfa_enabled FROM users");
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
main();
