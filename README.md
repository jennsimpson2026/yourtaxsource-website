# Your Tax Source - Client Portal
Last deployment trigger: 2026-06-02 20:20 UTC

Modern website and secure client portal for Your Tax Source, tax preparation and advisory services in Belmont, NC.

## Tech Stack
- **Framework:** Next.js (App Router) with Turbopack
- **Database:** Turso (SQLite)
- **ORM:** Drizzle ORM
- **Authentication:** Auth.js (NextAuth) with MFA (TOTP)
- **Email:** Resend
- **SMS:** Twilio
- **Storage:** AWS S3 (Secure uploads via pre-signed URLs)
- **Styling:** Tailwind CSS

## Prerequisites
- Node.js 18+
- A Turso database
- AWS S3 bucket and IAM credentials
- Resend API key
- Twilio Account SID, Auth Token, and Phone Number

## Getting Started

### 1. Clone and Install
```bash
git clone <repo-url>
cd your-tax-source
npm install
```

### 2. Environment Variables
Create a `.env` file based on the template below:
```env
# Database
DATABASE_URL="file:local.db"
DATABASE_AUTH_TOKEN="" # Required for remote Turso

# Auth.js
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# AWS S3
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_S3_BUCKET="your-tax-source-docs"

# Notifications
RESEND_API_KEY=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Admin Configuration
ADMIN_EMAIL="Jsimpson@yourtaxsource.com"
CONTACT_FORM_RECIPIENT="Jsimpson@yourtaxsource.com"
CRON_SECRET="your-cron-secret"
```

### 3. Database Management
```bash
# Push schema changes to DB
npm run db:push

# Seed the database with test accounts
npm run db:seed

# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

### 4. Development
```bash
npm run dev
```

### 5. Production Build
```bash
npm run build
```

## Security Implementation
- **MFA (TOTP):** Mandatory for Staff and Admin roles. Uses `otplib` with a custom compatibility wrapper for v13.
- **Data Retention:** Automated daily cleanup of soft-deleted documents older than 30 days via `/api/cron/retention`.
- **Audit Logging:** Every sensitive action (login, upload, download, role change) is logged in the `audit_logs` table.
- **Secure Storage:** All client documents are stored in private S3 buckets and accessed only via short-lived pre-signed URLs.
