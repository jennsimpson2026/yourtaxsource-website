import { createClient } from "@libsql/client";
async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
  console.log(result.rows.map(r => r.name));
}
main();
