const dotenv = require("dotenv");
dotenv.config({ path: ".env.production" });

// Use dynamic import or require to ensure env is loaded first
async function run() {
  const { db } = await import("./src/lib/db");
  const { users } = await import("./src/lib/db/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = require("bcryptjs");

  const email = "jsimpson@yourtaxsource.com";
  const password = "TaxSource2026!";
  const hash = await bcrypt.hash(password, 10);
  
  console.log(`Setting password for ${email} to ${password}`);
  console.log(`Hash: ${hash}`);

  try {
    const result = await db.update(users)
      .set({ 
        password: hash,
        name: "Jennifer Simpson (Admin)" 
      })
      .where(eq(users.email, email))
      .returning();
      
    console.log("Update successful:", JSON.stringify(result, null, 2));
    
    // Test the client too
    const clientEmail = "testclient@example.com";
    const clientResult = await db.update(users)
      .set({ 
        password: hash,
        name: "Test Client" 
      })
      .where(eq(users.email, clientEmail))
      .returning();
      
    console.log("Client update successful:", JSON.stringify(clientResult, null, 2));
  } catch (error) {
    console.error("Error updating database:", error);
  }
  process.exit(0);
}

run();
