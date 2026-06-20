import { db } from "../src/lib/db";
import { posts, categories, users } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function seedResources() {
  console.log("Seeding resources...");

  const authorId = "bbb8d9fa-2a41-4caa-b968-a1db918cf588"; // jsimpson@yourtaxsource.com

  // 1. Ensure Categories exist
  const resourceCategories = [
    { name: "Essential Checklists", slug: "checklists" },
    { name: "Government Resources", slug: "government-resources" },
    { name: "Frequently Asked Questions", slug: "faq" },
    { name: "Tax Tips", slug: "tax-tips" },
    { name: "Small Business", slug: "small-business" },
  ];

  const categoryMap = new Map();

  for (const cat of resourceCategories) {
    let category = await db.query.categories.findFirst({
      where: eq(categories.slug, cat.slug),
    });

    if (!category) {
      const [newCat] = await db.insert(categories).values(cat).returning();
      category = newCat;
    }
    categoryMap.set(cat.slug, category.id);
  }

  // 2. Seed Posts from Resources Page
  const checklistPosts = [
    {
      title: "What Do I Need For My Tax Appointment?",
      slug: "tax-appointment-checklist",
      content: "A master list of every document needed for a smooth filing experience.\n\n### Required Documents:\n- W-2s from all employers\n- 1099s for interest, dividends, and retirement distributions\n- 1099-NEC/K-1s for business or rental income\n- Health insurance statements (1095-A/B/C)\n- Mortgage interest statements (1098)\n- Charitable donation records",
      status: "published",
      categoryId: categoryMap.get("checklists"),
      isFeatured: true,
      authorId,
      publishDate: new Date(),
    },
    {
      title: "2024 Individual Tax Checklist",
      slug: "2024-individual-checklist",
      content: "Standard checklist for families and single filers in 2024.",
      status: "published",
      categoryId: categoryMap.get("checklists"),
      isFeatured: false,
      authorId,
      publishDate: new Date(),
    },
  ];

  const governmentPosts = [
    {
      title: "IRS.gov Official Website",
      slug: "irs-official-website",
      content: "The main hub for federal tax information and forms. [Visit IRS.gov](https://www.irs.gov)",
      status: "published",
      categoryId: categoryMap.get("government-resources"),
      isFeatured: false,
      authorId,
      publishDate: new Date(),
    },
    {
      title: "IRS: Where's My Refund?",
      slug: "irs-wheres-my-refund",
      content: "Track the status of your federal income tax refund. [Track Refund](https://www.irs.gov/refunds)",
      status: "published",
      categoryId: categoryMap.get("government-resources"),
      isFeatured: false,
      authorId,
      publishDate: new Date(),
    },
  ];

  const faqPosts = [
    {
      title: "How do I get my documents to you?",
      slug: "how-to-send-documents",
      content: "We use a secure, encrypted client portal. Once you sign up, you can upload your documents (photos of forms, PDFs, or spreadsheets) directly to our system from your phone or computer.",
      status: "published",
      categoryId: categoryMap.get("faq"),
      isFeatured: false,
      authorId,
      publishDate: new Date(),
    },
    {
      title: "What are your fees?",
      slug: "service-fees",
      content: "Our tax preparation fees vary based on the complexity of your return. Individual tax returns typically start at $125 for a basic/simple return.",
      status: "published",
      categoryId: categoryMap.get("faq"),
      isFeatured: false,
      authorId,
      publishDate: new Date(),
    },
  ];

  const allPosts = [...checklistPosts, ...governmentPosts, ...faqPosts];

  for (const postData of allPosts) {
    const existingPost = await db.query.posts.findFirst({
      where: eq(posts.slug, postData.slug),
    });

    if (!existingPost) {
      await db.insert(posts).values(postData);
      console.log(`Created post: ${postData.title}`);
    } else {
      console.log(`Post already exists: ${postData.title}`);
    }
  }

  console.log("Resource seeding complete.");
}

seedResources().catch(console.error);
