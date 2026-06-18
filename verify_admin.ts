import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://yourtaxsource-jsimpson.aws-us-east-1.turso.io",
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODE2NTIzNzgsImlkIjoiMDE5ZTZiNDgtNjIwMS03ZjBmLTgyZmItYWFjMTVjNTA2MGI0IiwicmlkIjoiNmU1MjFlZjctZWQ4NC00NjZiLTgwMDgtOTcwN2UyOGU0YWQxIn0.81B_HsenFV5ZdR4vF-RuQq4_A3WrSbsrEs1aAPqBInO0DyuhL9qxpdvbmX9vneLAEKRmoXL9Yj0wVWnitHX5BQ",
});

async function main() {
  const result = await client.execute({
    sql: "SELECT id, email, role FROM users WHERE email = ?",
    args: ["jsimpson@yourtaxsource.com"],
  });
  console.log("Admin User:", JSON.stringify(result.rows, null, 2));
}

main().catch(console.error);
