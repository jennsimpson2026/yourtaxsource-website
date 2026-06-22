import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

async function migrateDb() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  console.log("Migrating category 'tax-organizers' to 'helpful-forms'...");

  // 1. Find the category
  const existing = await client.execute({
    sql: "SELECT id FROM categories WHERE slug = 'tax-organizers'",
    args: []
  });

  if (existing.rows.length > 0) {
    const catId = existing.rows[0].id;
    
    // 2. Update category name and slug
    await client.execute({
      sql: "UPDATE categories SET name = 'Helpful Forms', slug = 'helpful-forms' WHERE id = ?",
      args: [catId]
    });
    console.log("Updated category name and slug.");
  } else {
    console.log("Category 'tax-organizers' not found. Checking if 'helpful-forms' already exists...");
    const helpful = await client.execute({
        sql: "SELECT id FROM categories WHERE slug = 'helpful-forms'",
        args: []
    });
    if (helpful.rows.length === 0) {
        // Create it if it doesn't exist
        await client.execute({
            sql: "INSERT INTO categories (id, name, slug) VALUES (?, 'Helpful Forms', 'helpful-forms')",
            args: [crypto.randomUUID()]
        });
        console.log("Created 'Helpful Forms' category.");
    }
  }

  console.log("Migration complete.");
}

migrateDb();
