// Seed the Stripe TEST MODE walkthrough data into the APP Turso DB (NOT team-db).
// Canonical accepted seed: client stripe-walkthrough-test@yourtaxsource.com + 2026 return ($350)
// + unpaid invoice + LOCKED final-return document (for the pay-to-unlock flow).
// Idempotent & self-cleaning: re-running removes prior seed rows for this exact test email.
require("dotenv").config({ path: "/home/team/shared/repository/.env" });
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const TEST_EMAIL = "stripe-walkthrough-test@yourtaxsource.com";
const TEST_NAME = "Stripe Walkthrough TEST Client";
const TEST_PASSWORD = "StripeWalkthrough2026!";
const TEST_PHONE = "(555) 019-2026";
const YEAR = 2026;
const FEE = 350.0;
const SURCHARGE_ENABLED = 1;
const NOW = Math.floor(Date.now() / 1000);

const uuid = () => crypto.randomUUID();

(async () => {
  console.log("DB host:", new URL(process.env.DATABASE_URL).host);

  // Idempotent cleanup of prior seed rows for THIS test user (incl. locked doc).
  const existing = await db.execute("SELECT id FROM users WHERE email = ?", [TEST_EMAIL]);
  if (existing.rows.length > 0) {
    const userId = existing.rows[0].id;
    const rets = await db.execute("SELECT id FROM tax_returns WHERE client_id = ?", [userId]);
    for (const r of rets.rows) {
      await db.execute("DELETE FROM documents WHERE return_id = ?", [r.id]);
      await db.execute("DELETE FROM invoices WHERE return_id = ?", [r.id]);
      await db.execute("DELETE FROM tax_returns WHERE id = ?", [r.id]);
    }
    await db.execute("DELETE FROM invoices WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM documents WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM profiles WHERE user_id = ?", [userId]);
    await db.execute("DELETE FROM users WHERE id = ?", [userId]);
    console.log("Cleaned prior seed for", TEST_EMAIL);
  }

  const userId = uuid();
  const profileId = uuid();
  const returnId = uuid();
  const invoiceId = uuid();
  const docId = uuid();
  const passwordHash = bcrypt.hashSync(TEST_PASSWORD, 10);

  // 1) Client user (MFA disabled, emailVerified set so login works smoothly)
  await db.execute(
    `INSERT INTO users (id, email, name, role, password, mfa_enabled, email_verified, created_at, updated_at)
     VALUES (?, ?, ?, 'CLIENT', ?, 0, ?, ?, ?)`,
    [userId, TEST_EMAIL, TEST_NAME, passwordHash, NOW, NOW, NOW]
  );

  // 2) Profile
  await db.execute(
    `INSERT INTO profiles (id, user_id, phone, city, state, zip_code)
     VALUES (?, ?, ?, 'Belmont', 'NC', '28012')`,
    [profileId, userId, TEST_PHONE]
  );

  // 3) 2026 Tax Return — AWAITING_PAYMENT, UNPAID, surcharge enabled
  await db.execute(
    `INSERT INTO tax_returns
       (id, client_id, year, status, payment_status, tax_prep_fee, waived_amount,
        manual_release, is_surcharge_enabled, is_complimentary, notes, created_at, updated_at)
     VALUES (?, ?, ?, 'AWAITING_PAYMENT', 'UNPAID', ?, 0, 0, ?, 0, ?, ?, ?)`,
    [returnId, userId, YEAR, FEE, SURCHARGE_ENABLED,
     "SEED — Stripe TEST MODE walkthrough (2026). Do not file. Delete after walkthrough.", NOW, NOW]
  );

  // 4) UNPAID invoice so the portal shows the Pay buttons (Stripe TEST MODE)
  await db.execute(
    `INSERT INTO invoices
       (id, user_id, return_id, amount, surcharge_amount, currency, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 0, 'USD', 'UNPAID', ?, ?)`,
    [invoiceId, userId, returnId, FEE, NOW, NOW]
  );

  // 5) LOCKED final-return document (is_locked=1) — pay-to-unlock: only unlocks at $0 balance or manual release
  await db.execute(
    `INSERT INTO documents
       (id, user_id, return_id, s3_key, file_name, file_type, file_size, category, tax_year, is_locked, status, uploaded_at)
     VALUES (?, ?, ?, ?, '2026_FINAL_RETURN_TEST.pdf', 'application/pdf', 0, 'FINAL_RETURN', ?, 1, 'PENDING', ?)`,
    [docId, userId, returnId, `test/seeded/${docId}.pdf`, YEAR, NOW]
  );

  console.log("\n=== SEEDED (TEST MODE) ===");
  console.log("Client email :", TEST_EMAIL);
  console.log("Client name  :", TEST_NAME);
  console.log("Client pw    :", TEST_PASSWORD);
  console.log("User ID      :", userId);
  console.log("2026 Return  :", returnId, "| status=AWAITING_PAYMENT | paymentStatus=UNPAID | fee=$" + FEE, "| surcharge=" + (SURCHARGE_ENABLED ? "ON" : "OFF"));
  console.log("Invoice ID   :", invoiceId, "| amount=$" + FEE, "| status=UNPAID");
  console.log("Doc ID       :", docId, "| 2026_FINAL_RETURN_TEST.pdf | category=FINAL_RETURN | is_locked=1 | status=PENDING");
  process.exit(0);
})().catch((e) => { console.error("SEED ERROR", e); process.exit(1); });
