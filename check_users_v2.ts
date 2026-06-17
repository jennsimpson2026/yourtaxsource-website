import { createClient } from "@libsql/client";

async function main() {
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  try {
    const result = await client.execute("PRAGMA table_info(users)");
    console.log("Current Users Columns:");
    console.log(result.rows.map(r => r.name).join(", "));
  } catch (e: any) {
    console.error(e.message);
  }
}
main();
