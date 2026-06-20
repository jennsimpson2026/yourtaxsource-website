import { db } from "./src/lib/db";
import { taxReturns, invoices, auditLogs, engagementLetters, users } from "./src/lib/db/schema";
import { eq, desc, and, gte, inArray, not } from "drizzle-orm";

async function test() {
  try {
    console.log("Testing DB queries...");
    
    // 1. Find a client user
    const client = await db.query.users.findFirst({
      where: eq(users.role, "CLIENT"),
    });
    
    if (!client) {
      console.log("No client found in DB.");
      return;
    }
    
    const userId = client.id;
    console.log(`Using userId: ${userId}`);

    // 2. Returns query
    const returns = await db.query.taxReturns.findMany({
      where: eq(taxReturns.clientId, userId),
      orderBy: [desc(taxReturns.year)],
    });
    console.log(`Found ${returns.length} returns.`);

    const returnIds = returns.map(r => r.id);

    // 3. Letters query
    const pendingLetters = returnIds.length > 0 
      ? await db.query.engagementLetters.findMany({
          where: and(
            inArray(engagementLetters.returnId, returnIds),
            eq(engagementLetters.status, "PENDING")
          )
        })
      : [];
    console.log(`Found ${pendingLetters.length} pending letters.`);

    // 4. Invoices query
    const unpaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.userId, userId),
        eq(invoices.status, "UNPAID")
      ),
    });
    console.log(`Found ${unpaidInvoices.length} unpaid invoices.`);

    // 5. Total Paid Invoices
    const totalPaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.userId, userId),
        eq(invoices.status, "PAID")
      ),
    });
    console.log(`Found ${totalPaidInvoices.length} paid invoices.`);

    // 6. Audit Logs
    const openRequests = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.targetId, userId),
        inArray(auditLogs.action, ["REQUEST_DOCUMENT", "REQUEST_DOCUMENTS"]),
        not(eq(auditLogs.status, "COMPLETED"))
      ),
      orderBy: [desc(auditLogs.createdAt)],
      limit: 5,
    });
    console.log(`Found ${openRequests.length} open requests.`);

    console.log("All queries successful!");
  } catch (error) {
    console.error("Query failed:", error);
  }
}

test();
