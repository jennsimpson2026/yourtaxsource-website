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
    const CHUNK_SIZE = 5;

    // Step 2: Iterate and sync each user in chunks to balance speed and rate limits
    for (let i = 0; i < targetUsers.length; i += CHUNK_SIZE) {
      const chunk = targetUsers.slice(i, i + CHUNK_SIZE);
      
      const chunkResults = await Promise.all(
        chunk.map((user) => 
          context.run(`sync-user-${user.id}`, async () => {
            try {
              const qboId = await getOrCreateQboCustomer(user.id);
              return { userId: user.id, status: "success", qboId };
            } catch (error: any) {
              console.error(`[QBO Sync] Error for user ${user.id}:`, error);
              return { userId: user.id, status: "error", error: error.message };
            }
          })
        )
      );

      results.push(...chunkResults);
    }

    // Final Step: Update workflow status
    await context.run("finalize", async () => {
      await db.update(workflows)
        .set({
          status: "successful",
          result: JSON.stringify({ 
            synced: results.filter(r => r.status === "success").length, 
            failed: results.filter(r => r.status === "error").length,
            details: results 
          }),
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
