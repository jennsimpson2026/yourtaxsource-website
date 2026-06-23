import { createClient } from '@libsql/client';
import { v4 as uuidv4 } from 'uuid';

async function migrate() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  console.log("Starting data migration for Resources...");

  // 1. Get Admin User
  const usersRes = await client.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
  const authorId = usersRes.rows[0]?.id as string;
  console.log("Using Author ID:", authorId);

  if (!authorId) {
     console.error("No admin user found!");
     return;
  }

  // 2. Get Category IDs
  const categoriesRes = await client.execute("SELECT id, slug FROM categories");
  const categories = categoriesRes.rows;
  
  const checklistId = categories.find(r => r.slug === 'checklists')?.id as string;
  const govId = categories.find(r => r.slug === 'government-resources')?.id as string;
  const formsId = categories.find(r => r.slug === 'helpful-forms' || r.slug === 'useful-forms')?.id as string;

  if (!checklistId || !govId || !formsId) {
    console.error("Missing categories!", { checklistId, govId, formsId });
    return;
  }

  // 3. Clear old records in these categories
  console.log("Cleaning up old records in these categories...");
  await client.execute({
    sql: "DELETE FROM posts WHERE category_id IN (?, ?, ?)",
    args: [checklistId, govId, formsId]
  });

  // 4. Add Checklists
  const checklists = [
    { title: "New Client Checklist", desc: "Essential items needed for your first tax appointment.", slug: "new-client-checklist" },
    { title: "Personal Tax Checklist", desc: "A comprehensive guide for individual filers.", slug: "personal-tax-checklist" },
    { title: "Small Business Checklist", desc: "What you need for your business tax return.", slug: "small-business-checklist" },
    { title: "Rental Property Checklist", desc: "Documentation required for real estate investments.", slug: "rental-property-checklist" },
    { title: "Self-Employed Checklist", desc: "Tax preparation for freelancers and contractors.", slug: "self-employed-checklist" },
  ];

  console.log("Adding Checklists...");
  for (const item of checklists) {
    await client.execute({
      sql: "INSERT INTO posts (id, title, slug, content, category_id, type, status, author_id, seo_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [uuidv4(), item.title, item.slug, item.desc, checklistId, 'resource', 'published', authorId, item.desc]
    });
  }

  // 5. Add Government Resources
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
      args: [uuidv4(), res.title, res.url, res.desc, govId, 'resource', 'published', authorId, res.url, res.desc]
    });
  }

  // 6. Add Helpful Forms
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
      args: [uuidv4(), form.title, form.title.toLowerCase().replace(/\s+/g, '-'), form.desc, formsId, 'resource', 'published', authorId, form.url, form.desc]
    });
  }

  console.log("Migration complete!");
}

migrate().catch(console.error);
