# System Architecture - Your Tax Source

## 1. Overview
The "Your Tax Source" platform consists of a public-facing website and a secure client portal. The goal is to provide a professional, trustworthy, and easy-to-use interface for tax preparation clients and staff.

## 2. Tech Stack
*   **Frontend/Fullstack:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
*   **Authentication:** [Auth.js (NextAuth)](https://authjs.dev/) with database adapter
*   **Database:** [Turso](https://turso.tech/) (SQLite for the Edge)
*   **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (lightweight and type-safe)
*   **File Storage:** [AWS S3](https://aws.amazon.com/s3/) (Private bucket with AES-256 Server-Side Encryption)
*   **Payments:** [Helcim](https://www.helcim.com/) (Integration for invoices and payments)
*   **Email:** [Resend](https://resend.com/) (Transactional emails)
*   **SMS:** [Twilio](https://www.twilio.com/) (MFA and notifications)
*   **Deployment:** [Vercel](https://vercel.com/)

## 3. Security Architecture
Security is paramount for tax professional data.

### 3.1 Authentication & Authorization
*   **MFA (Multi-Factor Authentication):** Enforced for all Admin/Staff accounts. Clients will be prompted to enable MFA (SMS or TOTP) for enhanced security.
*   **Role-Based Access Control (RBAC):**
    *   `CLIENT`: Access to their own documents, questionnaires, and return status.
    *   `STAFF`: Access to assigned clients, document review, and status updates.
    *   `ADMIN`: Full access to all clients, system settings, and audit logs.
*   **Session Management:** Secure, HTTP-only cookies for session tokens.

### 3.2 Data Protection
*   **Encryption at Rest:** Database and S3 storage utilize provider-managed AES-256 encryption.
*   **Sensitive Data Encryption:** High-sensitivity fields (e.g., SSN/Tax IDs) will be encrypted at the application level before database insertion using a managed key service (AWS KMS).
*   **Encryption in Transit:** Mandatory TLS 1.3 for all connections.

### 3.3 File Security
*   **Secure Uploads:** Files are uploaded directly to S3 via pre-signed POST URLs to minimize server load and exposure.
*   **Secure Downloads:** Files are never public. They are served via time-limited pre-signed URLs generated on-the-fly for authorized users.
*   **Virus Scanning:** Integration with a scanning service (e.g., ClamAV or S3 Malware Scanning) on upload.

### 3.4 Audit Logging
Every sensitive action is logged to a non-volatile `audit_logs` table:
*   User Login/Logout/MFA attempts
*   File Upload/Download/Delete
*   Status Changes (Return Status, Payment Status)
*   Data Modification (Profile changes, Questionnaire updates)
*   Access Denials

### 3.5 Payment Integration (Helcim)
*   **Invoicing:** Staff/Admin generate invoices in the portal, which calls the Helcim API to create an invoice.
*   **Payments:** Clients pay via a secure Helcim-hosted checkout or the Helcim Pay.js integration embedded in the portal to minimize PCI scope.
*   **Webhooks:** Helcim webhooks notify the platform of successful payments, which automatically updates the `tax_returns` payment status and the `invoices` table.

### 3.6 Calendar Integration (Microsoft 365)
*   **Booking System:** Integration with Microsoft Bookings or a custom Microsoft Graph API implementation to allow clients to schedule 1-hour appointments.
*   **Sync:** Real-time sync with the owner's Microsoft 365 calendar (`Jsimpson@yourtaxsource.com`).
*   **Notifications:** Automatic email/SMS notifications for both the client and the owner upon new bookings, cancellations, or reschedules.

## 4. Database Schema (Draft)

### Tables:
*   `users`: id, email, name, role, mfa_secret, email_verified, image
*   `profiles`: id, user_id, phone, address, encrypted_tax_id, preferences (JSON)
*   `tax_returns`: id, client_id, year, status (BACKLOG, IN_PROGRESS, REVIEW, READY_FOR_SIGNATURE, FILED), payment_status (UNPAID, PAID)
*   `documents`: id, return_id, user_id, s3_key, file_name, file_type, category (INTAKE, SUPPORTING, FINAL_RETURN), uploaded_at
*   `questionnaires`: id, client_id, return_id, data (JSONB), status (DRAFT, SUBMITTED, APPROVED)
*   `audit_logs`: id, user_id, action, target_type, target_id, metadata (JSONB), timestamp, ip_address
*   `invoices`: id, user_id, return_id, helcim_invoice_id, amount, status, paid_at

## 5. System Components
1.  **Public Website:** Home, About, Services, FAQ, Contact (Static/Dynamic content).
2.  **Client Portal:** Dashboard, Document Center, Intake Form, Secure Messaging, Payment History.
3.  **Admin Dashboard:** Client Management, Return Workflow, Document Review, Audit Log Viewer, User Management.
4.  **Notification Engine:** Automated updates via Email/SMS for status changes or document requests.
