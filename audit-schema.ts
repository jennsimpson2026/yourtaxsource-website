import { createClient } from "@libsql/client";

async function audit() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const tables = [
    "tax_returns",
    "invoices",
    "audit_logs",
    "documents",
    "profiles",
    "engagement_letters"
  ];

  console.log("--- PRODUCTION SCHEMA AUDIT ---");
  for (const table of tables) {
    console.log(`\nTable: ${table}`);
    try {
      const result = await client.execute(`PRAGMA table_info(${table})`);
      for (const row of result.rows) {
        console.log(`  - ${row.name} (${row.type}) ${row.notnull ? "NOT NULL" : "NULL"} DEFAULT: ${row.dflt_value}`);
      }
    } catch (error) {
      console.error(`  Error auditing table ${table}:`, error);
    }
  }
  console.log("\n--- AUDIT COMPLETE ---");
}

audit();
