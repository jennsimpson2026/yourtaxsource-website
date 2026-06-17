import { createClient } from "@libsql/client";

async function main() {
  const table = process.argv[2];
  const client = createClient({ url: process.env.URL!, authToken: process.env.TOKEN! });
  try {
    const result = await client.execute(`PRAGMA table_info(${table})`);
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (e: any) {
    console.error(e.message);
  }
}
main();
