import { db } from "./src/lib/db";
import { taxReturns } from "./src/lib/db/schema";

async function main() {
  const returns = await db.select().from(taxReturns);
  console.log(JSON.stringify(returns, null, 2));
}

main().catch(console.error);
