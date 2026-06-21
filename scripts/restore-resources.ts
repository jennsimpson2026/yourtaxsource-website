import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

async function restoreResources() {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.production") });

  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const categoriesToEnsure = [
    { name: "Essential Checklists", slug: "checklists" },
    { name: "Government Resources", slug: "government-resources" },
    { name: "Tax Packets & Organizers", slug: "tax-organizers" },
    { name: "Client Instructions", slug: "client-info" },
    { name: "Fees & Payments", slug: "billing-info" },
    { name: "Frequently Asked Questions", slug: "faq" },
  ];

  console.log("Ensuring categories exist...");
  for (const cat of categoriesToEnsure) {
    const existing = await client.execute({
      sql: "SELECT id FROM categories WHERE slug = ?",
      args: [cat.slug]
    });
    if (existing.rows.length === 0) {
      await client.execute({
        sql: "INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)",
        args: [crypto.randomUUID(), cat.name, cat.slug]
      });
      console.log(`Created category: ${cat.name}`);
    }
  }

  // Get category IDs
  const allCats = await client.execute("SELECT id, slug FROM categories");
  const catMap = Object.fromEntries(allCats.rows.map(row => [row.slug, row.id]));

  // Get admin user ID
  const adminUser = await client.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  const authorId = adminUser.rows[0]?.id as string || "system";

  const postsToEnsure = [
    { title: "New Client Checklist", slug: "new-client-checklist", cat: "checklists" },
    { title: "Personal Tax Checklist", slug: "personal-tax-checklist", cat: "checklists" },
    { title: "Small Business Checklist", slug: "small-business-checklist", cat: "checklists" },
    { title: "Rental Property Checklist", slug: "rental-property-checklist", cat: "checklists" },
    { title: "Self-Employed Checklist", slug: "self-employed-checklist", cat: "checklists" },
    { title: "Tax Organizer PDFs", slug: "tax-organizer-pdfs", cat: "tax-organizers" },
    { title: "Downloadable packets/forms", slug: "downloadable-forms", cat: "tax-organizers" },
    { title: "Government links", slug: "government-links", cat: "government-resources" },
    { title: "Helpful tax links", slug: "helpful-tax-links", cat: "government-resources" },
    { title: "Upload/document instructions", slug: "upload-instructions", cat: "client-info" },
    { title: "Tax Source Tracker", slug: "tax-source-tracker", cat: "client-info" },
    { title: "Service fee/payment information", slug: "fee-payment-info", cat: "billing-info" },
  ];

  console.log("Ensuring placeholder posts exist...");
  for (const p of postsToEnsure) {
    const existing = await client.execute({
      sql: "SELECT id FROM posts WHERE slug = ?",
      args: [p.slug]
    });
    if (existing.rows.length === 0) {
      const categoryId = catMap[p.cat];
      if (!categoryId) {
        console.error(`Category not found: ${p.cat}`);
        continue;
      }
      await client.execute({
        sql: `INSERT INTO posts (id, title, slug, content, category_id, type, status, author_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, 'resource', 'published', ?, strftime('%s', 'now'), strftime('%s', 'now'))`,
        args: [
          crypto.randomUUID(),
          p.title,
          p.slug,
          `Placeholder content for ${p.title}. This document will contain detailed information and links for Your Tax Source clients.`,
          categoryId,
          authorId
        ]
      });
      console.log(`Created post: ${p.title}`);
    }
  }

  console.log("Resource restoration complete.");
}

restoreResources();
