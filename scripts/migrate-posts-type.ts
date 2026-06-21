import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

async function runMigration() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log("Adding 'type' column to 'posts' table...");
    await client.execute("ALTER TABLE posts ADD COLUMN type TEXT NOT NULL DEFAULT 'blog'");
    console.log("Success!");

    console.log("Updating existing resources to type = 'resource'...");
    // We'll classify based on categories.
    // Let's first see what categories we have.
    const categories = await client.execute("SELECT id, name FROM categories");
    console.log("Categories:", JSON.stringify(categories.rows, null, 2));

    // Common resource categories
    const resourceCategoryKeywords = ["checklist", "resource", "faq", "tip", "small business"];
    const resourceCategoryIds = categories.rows
      .filter(row => resourceCategoryKeywords.some(keyword => (row.name as string).toLowerCase().includes(keyword)))
      .map(row => row.id);

    if (resourceCategoryIds.length > 0) {
      const placeholders = resourceCategoryIds.map(() => "?").join(",");
      await client.execute({
        sql: `UPDATE posts SET type = 'resource' WHERE category_id IN (${placeholders})`,
        args: resourceCategoryIds
      });
      console.log(`Updated posts in categories [${resourceCategoryIds.join(",")}] to 'resource'`);
    }

  } catch (error: any) {
    if (error.message && error.message.includes("duplicate column name: type")) {
      console.log("Column 'type' already exists.");
    } else {
      console.error("Error:", error);
    }
  }
}

runMigration();
