import { db } from "./src/lib/db";
import { users } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const allUsers = await db.select().from(users).all();
  console.log("All users in DB:", JSON.stringify(allUsers, null, 2));
}

main().catch(console.error);
