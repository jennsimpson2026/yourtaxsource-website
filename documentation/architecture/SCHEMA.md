# Database Schema - Your Tax Source (SQLite/Turso)

This document outlines the database schema using SQLite syntax via Drizzle ORM.

## Enums (Handled as TEXT in SQLite)

*   `user_role`: 'CLIENT', 'STAFF', 'ADMIN'
*   `return_status`: 'NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'READY_FOR_SIGNATURE', 'READY_FOR_PAYMENT', 'FILED'
*   `document_category`: 'INTAKE', 'SUPPORTING', 'FINAL_RETURN', 'ID_VERIFICATION'
*   `payment_status`: 'UNPAID', 'PARTIAL', 'PAID', 'VOID'

## Tables

### `users`
*   `id`: TEXT (Primary Key - UUID)
*   `email`: TEXT (Unique, Not Null)
*   `name`: TEXT
*   `role`: TEXT (Default: 'CLIENT')
*   `password`: TEXT (Hashed)
*   `mfa_enabled`: INTEGER (Boolean: 0 or 1)
*   `mfa_secret`: TEXT (Encrypted)
*   `email_verified`: INTEGER (Timestamp)
*   `image`: TEXT
*   `created_at`: INTEGER (Timestamp)
*   `updated_at`: INTEGER (Timestamp)

### `profiles`
*   `id`: TEXT (Primary Key - UUID)
*   `user_id`: TEXT (Foreign Key -> users.id, Index: `profiles_user_id_idx`)
*   `phone`: TEXT
*   `address_line1`: TEXT
*   `address_line2`: TEXT
*   `city`: TEXT
*   `state`: TEXT
*   `zip_code`: TEXT
*   `encrypted_ssn`: TEXT
*   `date_of_birth`: TEXT (ISO Date)

### `tax_returns`
*   `id`: TEXT (Primary Key - UUID)
*   `client_id`: TEXT (Foreign Key -> users.id, Index: `tax_returns_client_id_idx`)
*   `year`: INTEGER
*   `status`: TEXT (Default: 'NOT_STARTED')
*   `payment_status`: TEXT (Default: 'UNPAID')
*   `assigned_staff_id`: TEXT (Foreign Key -> users.id)
*   `notes`: TEXT
*   `created_at`: INTEGER
*   `updated_at`: INTEGER

### `documents`
*   `id`: TEXT (Primary Key - UUID)
*   `user_id`: TEXT (Foreign Key -> users.id, Index: `documents_user_id_idx`)
*   `return_id`: TEXT (Foreign Key -> tax_returns.id, Index: `documents_return_id_idx`)
*   `s3_key`: TEXT (Unique)
*   `file_name`: TEXT
*   `file_type`: TEXT
*   `file_size`: INTEGER
*   `category`: TEXT
*   `uploaded_at`: INTEGER
*   `deleted_at`: INTEGER

### `questionnaires`
*   `id`: TEXT (Primary Key - UUID)
*   `client_id`: TEXT (Foreign Key -> users.id, Index: `questionnaires_client_id_idx`)
*   `return_id`: TEXT (Foreign Key -> tax_returns.id, Index: `questionnaires_return_id_idx`)
*   `data`: TEXT (JSON string)
*   `is_submitted`: INTEGER (Boolean)
*   `submitted_at`: INTEGER

### `audit_logs`
*   `id`: TEXT (Primary Key - UUID)
*   `user_id`: TEXT (Foreign Key -> users.id, Index: `audit_logs_user_id_idx`)
*   `action`: TEXT
*   `target_type`: TEXT
*   `target_id`: TEXT
*   `metadata`: TEXT (JSON string)
*   `ip_address`: TEXT
*   `created_at`: INTEGER

### `invoices`
*   `id`: TEXT (Primary Key - UUID)
*   `user_id`: TEXT (Foreign Key -> users.id, Index: `invoices_user_id_idx`)
*   `return_id`: TEXT (Foreign Key -> tax_returns.id, Index: `invoices_return_id_idx`)
*   `helcim_invoice_id`: TEXT
*   `amount`: REAL
*   `currency`: TEXT (Default: 'USD')
*   `status`: TEXT
*   `paid_at`: INTEGER

### `appointments`
*   `id`: TEXT (Primary Key - UUID)
*   `user_id`: TEXT (Foreign Key -> users.id, Index: `appointments_user_id_idx`)
*   `booking_id`: TEXT
*   `start_time`: INTEGER
*   `end_time`: INTEGER
*   `status`: TEXT (Default: 'SCHEDULED')
*   `created_at`: INTEGER
