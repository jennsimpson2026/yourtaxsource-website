import { createClient } from "@libsql/client";
async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  const result = await client.execute("SELECT id, email, role FROM users");
  console.log("USER_LIST_START");
  console.log(JSON.stringify(result.rows, null, 2));
  console.log("USER_LIST_END");
}
main();
