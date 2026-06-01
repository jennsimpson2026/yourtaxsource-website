# Security Protocols - Your Tax Source

## 1. Data Encryption

### 1.1 In-Transit
*   All communication between the client (browser) and server must use TLS 1.3.
*   HSTS (HTTP Strict Transport Security) will be enabled with a long max-age and `includeSubDomains` and `preload` flags.

### 1.2 At-Rest
*   **Database:** Use RDS/Supabase volume encryption (AES-256).
*   **Storage:** Use AWS S3 Server-Side Encryption (SSE-S3 or SSE-KMS).

### 1.3 Application-Level Encryption
*   Personally Identifiable Information (PII) such as Social Security Numbers (SSN) and Tax Identification Numbers must be encrypted at the application layer before being sent to the database.
*   Use a modern, standard encryption library (e.g., `crypto` module in Node.js with AES-256-GCM) or a managed service like AWS KMS.
*   Encryption keys must be rotated annually and stored securely in environment variables or a secret manager (e.g., Vercel Environment Variables, AWS Secrets Manager).

## 2. Authentication & MFA

### 2.1 Multi-Factor Authentication (MFA)
*   MFA is **mandatory** for all Staff and Admin accounts.
*   Supported MFA methods:
    1.  TOTP (Time-based One-Time Password) via apps like Google Authenticator or Authy. Implemented using `otplib` with a compatibility wrapper for Next.js.
    2.  SMS (Twilio integration).
*   MFA setup is required upon first login for staff.

### 2.2 Password Policy
*   Minimum 12 characters.
*   Must include uppercase, lowercase, numbers, and symbols.
*   Checked against common password lists (e.g., HaveIBeenPwned API).

## 3. Authorization & Access Control

### 3.1 Role-Based Access Control (RBAC)
*   Access is granted based on the principle of least privilege.
*   Client data is partitioned by `user_id`. Clients can only access records where `user_id` matches their session.
*   Staff can only access clients assigned to them or those marked for general review.
*   Admins have global read/write access but all actions are logged.

### 3.2 Secure File Access
*   S3 buckets are private and block all public access.
*   Files are served via **Pre-signed URLs** with a short expiration time (e.g., 5-15 minutes).
*   Requests for pre-signed URLs must be authenticated and authorized against the database (checking ownership/permissions).

## 4. Audit & Monitoring

### 4.1 Audit Logging
*   The `audit_logs` table is the source of truth for system activity.
*   Logs are "append-only" from the application's perspective.
*   Key events to log:
    *   Auth events (login, logout, MFA failure).
    *   Data access (sensitive record viewing).
    *   Data modification (status changes, PII updates).
    *   File actions (upload, download, delete).
    *   Permission changes.

### 4.2 Security Headers
The following headers must be present on all responses:
*   `Content-Security-Policy`: Restrict sources for scripts, styles, and objects.
*   `X-Frame-Options: DENY`: Prevent clickjacking.
*   `X-Content-Type-Options: nosniff`: Prevent MIME-type sniffing.
*   `Referrer-Policy: strict-origin-when-cross-origin`.
*   `Permissions-Policy`: Restrict browser features (camera, microphone, etc.).

## 5. Compliance & Data Retention
*   The system is designed with IRS Publication 4557 (Safeguarding Taxpayer Data) in mind.
*   **Data Retention:** Documents and data should be retained for at least 3 years (or as required by law) and then securely deleted.
*   **Secure Disposal:** Deleting a document in the UI triggers a soft-delete in the database (setting `deleted_at`). A daily cron job at `/api/cron/retention` (secured via `CRON_SECRET`) permanently deletes files from S3 and records from the database once they are older than 30 days.
