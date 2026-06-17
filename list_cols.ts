import { createClient } from "@libsql/client";
async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  const result = await client.execute("SELECT * FROM users LIMIT 0");
  console.log(result.columns);
}
main();
