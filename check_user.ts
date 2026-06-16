import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

const client = createClient({
  url: "libsql://yourtaxsource-jsimpson.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3ODA5NjIwMzMsImlhdCI6MTc4MDM1NzIzMywiaWQiOiIwMTllNmI0OC02MjAxLTdmMGYtODJmYi1hYWMxNWM1MDYwYjQiLCJyaWQiOiI2ZTUyMWVmNy1lZDg0LTQ2NmItODAwOC05NzA3ZTI4ZTRhZDEifQ.3D2yF6w-egqU2sx85vG1tw8ZPnnZVN3CdIdgKsGyDWVX8CQuM9EEhLiAsW_uoCLF8laYPxBYGEeN9HzNl3zkAQ",
});

const db = drizzle(client);

async function main() {
  const allUsers = await db.select().from(users);
  console.log("All Users:", JSON.stringify(allUsers, null, 2));
}

main().catch(console.error);
