import { serve } from "@upstash/workflow/nextjs";
import { db } from "@/lib/db";
import { users, workflows } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { getOrCreateQboCustomer } from "@/lib/qbo";

export const { POST } = serve<{
  userIds?: string[];
}>(async (context) => {
  const { userIds } = context.requestPayload;

  try {
    // Step 1: Fetch users to sync
    const targetUsers = await context.run("fetch-users", async () => {
      if (userIds && userIds.length > 0) {
        return await db.query.users.findMany({
          where: inArray(users.id, userIds),
        });
      } else {
        // Default to all CLIENTS
        return await db.query.users.findMany({
          where: eq(users.role, "CLIENT"),
        });
      }
    });

    const results: any[] = [];

    // Step 2: Iterate and sync each user
    // We use chunks or parallel execution if supported, 
    // but for simplicity we'll iterate and use context.run for each
    for (const user of targetUsers) {
      try {
        const qboId = await context.run(`sync-user-${user.id}`, async () => {
          return await getOrCreateQboCustomer(user.id);
        });
        results.push({ userId: user.id, status: "success", qboId });
      } catch (error: any) {
        results.push({ userId: user.id, status: "error", error: error.message });
      }
    }

    // Final Step: Update workflow status
    await context.run("finalize", async () => {
      await db.update(workflows)
        .set({
          status: "successful",
          result: JSON.stringify({ synced: results.length, details: results }),
          updatedAt: new Date(),
        })
        .where(eq(workflows.id, context.workflowRunId));
    });
  } catch (error: any) {
    console.error("QBO Sync Workflow Error:", error);
    await db.update(workflows)
      .set({
        status: "failed",
        error: error.message || "Unknown error",
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, context.workflowRunId));
    throw error;
  }
});
