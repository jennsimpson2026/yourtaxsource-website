import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

async function main() {
  const content = `## Test Heading

This has **bold text** and *italic text*.

- Item one

- Item two

[Resources](/resources)`;

  try {
    const id = "markdown-test-post-" + Date.now();
    await client.execute({
      sql: "INSERT INTO posts (id, title, slug, content, status, type, category_id, author_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [
        id,
        "Markdown Rendering Verification",
        "markdown-rendering-verification",
        content,
        "draft",
        "blog",
        "a5887cf8-ac4c-4da9-bf78-369d1eb7fda7", 
        "94d9f84e-ab6c-49bd-a7af-b13dcfee07a8", 
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000)
      ]
    });
    console.log("Inserted test post with id:", id);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit(0);
  }
}

main();
