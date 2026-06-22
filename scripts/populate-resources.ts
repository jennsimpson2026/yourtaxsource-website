import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

async function migrate() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  const AUTHOR_ID = 'admin-1';

  console.log("Starting data migration for Resources...");

  // 1. Get Category IDs
  const categories = await client.execute("SELECT id, slug FROM categories");
  
  const checklistId = categories.rows.find(r => r.slug === 'checklists')?.id;
  const govId = categories.rows.find(r => r.slug === 'government-resources')?.id;
  const formsId = categories.rows.find(r => r.slug === 'helpful-forms' || r.slug === 'useful-forms')?.id;

  if (!checklistId || !govId || !formsId) {
    console.error("Missing categories!", { checklistId, govId, formsId });
    return;
  }

  // 2. Clear old records in these categories
  console.log("Cleaning up old records in these categories...");
  await client.execute({
    sql: "DELETE FROM posts WHERE category_id IN (?, ?, ?)",
    args: [checklistId, govId, formsId]
  });

  // 3. Add Checklists
  const checklists = [
    { title: "New Client Checklist", desc: "Essential items needed for your first tax appointment." },
    { title: "Personal Tax Checklist", desc: "A comprehensive guide for individual filers." },
    { title: "Small Business Checklist", desc: "What you need for your business tax return." },
    { title: "Rental Property Checklist", desc: "Documentation required for real estate investments." },
    { title: "Self-Employed Checklist", desc: "Tax preparation for freelancers and contractors." },
  ];

  console.log("Adding Checklists...");
  for (const item of checklists) {
    await client.execute({
      sql: "INSERT INTO posts (id, title, slug, content, category_id, type, status, author_id, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [uuidv4(), item.title, item.title.toLowerCase().replace(/\s+/g, '-'), item.desc, checklistId, 'resource', 'published', AUTHOR_ID, item.desc]
    });
  }

  // 4. Add Government Resources
  const govResources = [
    { title: "IRS.gov", url: "https://www.irs.gov", desc: "Official Internal Revenue Service website." },
    { title: "Where’s My Refund?", url: "https://www.irs.gov/refunds", desc: "Check the status of your federal income tax refund." },
    { title: "IRS Where’s My Amended Return?", url: "https://www.irs.gov/filing/wheres-my-amended-return", desc: "Track the status of your amended tax return." },
    { title: "Pay Federal Tax Balance", url: "https://www.irs.gov/payments", desc: "Securely pay your federal taxes online." },
    { title: "NC DOR Where’s My Refund?", url: "https://www.ncdor.gov/file-pay/refund-status", desc: "Check your North Carolina state refund status." },
    { title: "NC Pay Balance Due", url: "https://www.ncdor.gov/file-pay/pay-online", desc: "Pay your North Carolina state taxes online." },
    { title: "SC Where’s My Refund?", url: "https://dor.sc.gov/refund", desc: "Check your South Carolina state refund status." },
    { title: "SC Pay Balance Due", url: "https://dor.sc.gov/pay", desc: "Pay your South Carolina state taxes online." },
  ];

  console.log("Adding Government Resources...");
  for (const res of govResources) {
    await client.execute({
      sql: "INSERT INTO posts (id, title, slug, content, category_id, type, status, author_id, featured_image_url, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [uuidv4(), res.title, res.url, res.desc, govId, 'resource', 'published', AUTHOR_ID, res.url, res.desc]
    });
  }

  // 5. Add Helpful Forms
  const forms = [
    { title: "W-4", desc: "Employee's Withholding Certificate.", url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
    { title: "W-9", desc: "Request for Taxpayer Identification Number and Certification.", url: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
    { title: "Form 1040", desc: "U.S. Individual Income Tax Return.", url: "https://www.irs.gov/pub/irs-pdf/f1040.pdf" },
    { title: "Form 1040-ES", desc: "Estimated Tax for Individuals.", url: "https://www.irs.gov/pub/irs-pdf/f1040es.pdf" },
    { title: "Penalty Abatement Form", desc: "Request for Abatement of Penalty.", url: "https://www.irs.gov/pub/irs-pdf/f843.pdf" },
  ];

  console.log("Adding Helpful Forms...");
  for (const form of forms) {
    await client.execute({
      sql: "INSERT INTO posts (id, title, slug, content, category_id, type, status, author_id, featured_image_url, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [uuidv4(), form.title, form.title.toLowerCase().replace(/\s+/g, '-'), form.desc, formsId, 'resource', 'published', AUTHOR_ID, form.url, form.desc]
    });
  }

  console.log("Migration complete!");
}

migrate();
