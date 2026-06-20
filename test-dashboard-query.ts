import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./src/lib/db/schema";
import { and, eq, not, gt, inArray } from "drizzle-orm";

async function test() {
  const client = createClient({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client, { schema });

  try {
    const returns = await db.query.taxReturns.findMany({
      where: and(
        inArray(schema.taxReturns.status, ["FILED", "AWAITING_PAYMENT", "READY_FOR_SIGNATURE"]),
        not(eq(schema.taxReturns.paymentStatus, "PAID")),
        gt(schema.taxReturns.taxPrepFee, 0)
      ),
    });
    console.log("Found", returns.length, "outstanding returns");
    console.log(JSON.stringify(returns, null, 2));
  } catch (error) {
    console.error(error);
  }
}

test();
