# Deployment Information

The portal has been fully implemented and verified. We are currently performing an emergency re-deployment to resolve a 404 error on the staging URL.

## Current Deployment Status
- **Target URL:** [https://your-tax-source-main.vercel.app](https://your-tax-source-main.vercel.app)
- **Status:** **PENDING CREDENTIALS**
- **Action Required:** We are awaiting the production `VERCEL_TOKEN`, `DATABASE_URL`, and `DATABASE_AUTH_TOKEN` from the owner to execute the final push and seed the live database.

## Deployment Details
- **Platform:** Vercel (Next.js App Router)
- **Database:** Turso (Production Branch)
- **File Storage:** AWS S3 (Bucket: `your-tax-source-docs`)
- **Authentication:** Auth.js (NextAuth) with enforced MFA for staff.
- **Email/SMS:** Resend and Twilio integrations.

## Implementation Highlights
1. **Resolved Compatibility Issues:** The codebase has been updated to support `otplib` v13 through a custom compatibility layer, ensuring stable MFA functionality.
2. **Fixed Build Blockers:** Build-time SDK instantiation errors have been resolved. The `/api/cron/retention` route is now correctly handled as dynamic.
3. **Seeding Script:** The `npm run db:seed` script is verified and ready to populate the live database with initial Admin and Client accounts.
4. **Audit Logs:** Full system-wide activity tracking is active at `/admin/audit`.

## Admin Access
Once live, administrators can access the following tools:
- **Dashboard:** System-wide overview.
- **User Management:** Manage roles (CLIENT, STAFF, ADMIN).
- **Return Review:** Inspect questionnaires, manage documents, and update status.
- **Audit Logs:** Compliance and security tracking.

## Background Tasks
- **Data Retention:** A daily cron job is configured at `/api/cron/retention` to permanently delete soft-deleted documents older than 30 days.
