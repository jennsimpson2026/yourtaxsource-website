import { createClient } from "@libsql/client";
async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  const result = await client.execute("SELECT * FROM tax_returns LIMIT 1");
  console.log(JSON.stringify(result.rows, null, 2));
}
main();
