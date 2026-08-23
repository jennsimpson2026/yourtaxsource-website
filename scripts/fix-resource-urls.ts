import { createClient } from '@libsql/client';

async function fix() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  });

  console.log("Restoring resource URLs...");

  const updates = [
    // Helpful Forms
    { title: "W-4", url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
    { title: "Form W-4", url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
    { title: "W-9", url: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
    { title: "Form W-9", url: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
    { title: "Form 1040", url: "https://www.irs.gov/pub/irs-pdf/f1040.pdf" },
    { title: "Form 1040-ES", url: "https://www.irs.gov/pub/irs-pdf/f1040es.pdf" },
    { title: "Penalty Abatement Form", url: "https://www.irs.gov/pub/irs-pdf/f843.pdf" },
    { title: "First-Time Penalty Abatement", url: "https://www.irs.gov/pub/irs-pdf/f843.pdf" },
    
    // Team-db variations
    { title: "Form W-4: Employee Withholding", url: "https://www.irs.gov/pub/irs-pdf/fw4.pdf" },
    { title: "Form W-9: Request for TIN", url: "https://www.irs.gov/pub/irs-pdf/fw9.pdf" },
    { title: "Form 1040: U.S. Individual Income Tax Return", url: "https://www.irs.gov/pub/irs-pdf/f1040.pdf" },
    { title: "Form 1040-ES: Estimated Tax for Individuals", url: "https://www.irs.gov/pub/irs-pdf/f1040es.pdf" },

    // Government Resources
    { title: "IRS.gov", url: "https://www.irs.gov" },
    { title: "Where’s My Refund?", url: "https://www.irs.gov/refunds" },
    { title: "IRS: Where's My Refund?", url: "https://www.irs.gov/refunds" },
    { title: "IRS: Where's My Amended Return?", url: "https://www.irs.gov/filing/wheres-my-amended-return" },
    { title: "Where’s My Amended Return?", url: "https://www.irs.gov/filing/wheres-my-amended-return" },
    { title: "Pay Your Federal Taxes Online", url: "https://www.irs.gov/payments" },
    { title: "Make a Federal Tax Payment", url: "https://www.irs.gov/payments" },
    { title: "Pay Federal Tax Balance", url: "https://www.irs.gov/payments" },
    { title: "North Carolina Department of Revenue (NC DOR)", url: "https://www.ncdor.gov" },
    { title: "NC DOR Where’s My Refund?", url: "https://www.ncdor.gov/file-pay/refund-status" },
    { title: "NC Pay Balance Due", url: "https://www.ncdor.gov/file-pay/pay-online" },
    { title: "South Carolina Department of Revenue (SC DOR)", url: "https://dor.sc.gov" },
    { title: "SC Where’s My Refund?", url: "https://dor.sc.gov/refund" },
    { title: "SC Pay Balance Due", url: "https://dor.sc.gov/pay" },
  ];

  for (const update of updates) {
    console.log(`Updating ${update.title}...`);
    await client.execute({
      sql: "UPDATE posts SET featured_image_url = ? WHERE title = ? AND type = 'resource'",
      args: [update.url, update.title]
    });
  }

  console.log("Done.");
}

fix().catch(console.error);
