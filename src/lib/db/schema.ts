import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("CLIENT").notNull(), // 'CLIENT', 'STAFF', 'ADMIN'
  password: text("password"),
  mfaEnabled: integer("mfa_enabled", { mode: "boolean" }).default(false).notNull(),
  mfaSecret: text("mfa_secret"),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  lastReminderAt: integer("last_reminder_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  roleIdx: index("users_role_idx").on(table.role),
}));

export const verificationTokens = sqliteTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").primaryKey(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  documents: many(documents),
  taxReturns: many(taxReturns),
  invoices: many(invoices),
  annualUpdates: many(annualUpdates),
  posts: many(posts),
  auditLogs: many(auditLogs),
  appointments: many(appointments),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
}));

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  encryptedSsn: text("encrypted_ssn"),
  dateOfBirth: text("date_of_birth"),
  qboCustomerId: text("qbo_customer_id"),
}, (table) => ({
  userIdIdx: index("profiles_user_id_idx").on(table.userId),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const taxReturns = sqliteTable("tax_returns", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id")
    .references(() => users.id)
    .notNull(),
  year: integer("year").notNull(),
  status: text("status").default("NOT_STARTED").notNull(), // 'NOT_STARTED', 'IN_PROCESS', 'READY_FOR_SIGNATURE', 'AWAITING_PAYMENT', 'READY_TO_FILE', 'COMPLETED'
  paymentStatus: text("payment_status").default("UNPAID").notNull(),
  assignedStaffId: text("assigned_staff_id").references(() => users.id),
  federalResult: real("federal_result"),
  stateResults: text("state_results"), // JSON string
  taxPrepFee: real("tax_prep_fee").default(0),
  manualRelease: integer("manual_release", { mode: "boolean" }).default(false).notNull(),
  isComplimentary: integer("is_complimentary", { mode: "boolean" }).default(false).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  clientIdIdx: index("tax_returns_client_id_idx").on(table.clientId),
  yearIdx: index("tax_returns_year_idx").on(table.year),
  statusIdx: index("tax_returns_status_idx").on(table.status),
}));

export const taxReturnsRelations = relations(taxReturns, ({ one, many }) => ({
  client: one(users, {
    fields: [taxReturns.clientId],
    references: [users.id],
  }),
  documents: many(documents),
  invoices: many(invoices),
  engagementLetters: many(engagementLetters),
  annualUpdate: one(annualUpdates, {
    fields: [taxReturns.id],
    references: [annualUpdates.returnId],
  }),
  questionnaire: one(questionnaires, {
    fields: [taxReturns.id],
    references: [questionnaires.returnId],
  }),
}));

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  returnId: text("return_id").references(() => taxReturns.id),
  s3Key: text("s3_key").notNull().unique(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  category: text("category").notNull(),
  taxYear: integer("tax_year"),
  isLocked: integer("is_locked", { mode: "boolean" }).default(true).notNull(),
  status: text("status").default("PENDING").notNull(), // 'PENDING', 'ACCEPTED', 'REJECTED', 'CLARIFICATION_REQUESTED'
  reviewFeedback: text("review_feedback"),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  reviewedBy: text("reviewed_by").references(() => users.id),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => ({
  userIdIdx: index("documents_user_id_idx").on(table.userId),
  returnIdIdx: index("documents_return_id_idx").on(table.returnId),
  categoryIdx: index("documents_category_idx").on(table.category),
  statusIdx: index("documents_status_idx").on(table.status),
  uploadedAtIdx: index("documents_uploaded_at_idx").on(table.uploadedAt),
  taxYearIdx: index("documents_tax_year_idx").on(table.taxYear),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [documents.returnId],
    references: [taxReturns.id],
  }),
}));

export const questionnaires = sqliteTable("questionnaires", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id")
    .references(() => users.id)
    .notNull(),
  returnId: text("return_id")
    .references(() => taxReturns.id)
    .notNull(),
  data: text("data").notNull(), // JSON string
  isSubmitted: integer("is_submitted", { mode: "boolean" }).default(false).notNull(),
  submittedAt: integer("submitted_at", { mode: "timestamp" }),
}, (table) => ({
  clientIdIdx: index("questionnaires_client_id_idx").on(table.clientId),
  returnIdIdx: index("questionnaires_return_id_idx").on(table.returnId),
}));

export const questionnairesRelations = relations(questionnaires, ({ one }) => ({
  client: one(users, {
    fields: [questionnaires.clientId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [questionnaires.returnId],
    references: [taxReturns.id],
  }),
}));

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  status: text("status").default("PENDING"),
  metadata: text("metadata"), // JSON string
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  targetIdIdx: index("audit_logs_target_id_idx").on(table.targetId),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  returnId: text("return_id")
    .references(() => taxReturns.id)
    .notNull(),
  helcimInvoiceId: text("helcim_invoice_id"),
  qboInvoiceId: text("qbo_invoice_id"),
  qboSalesReceiptId: text("qbo_sales_receipt_id"),
  amount: real("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("UNPAID").notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("invoices_user_id_idx").on(table.userId),
  returnIdIdx: index("invoices_return_id_idx").on(table.returnId),
  statusIdx: index("invoices_status_idx").on(table.status),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [invoices.returnId],
    references: [taxReturns.id],
  }),
}));

export const engagementLetters = sqliteTable("engagement_letters", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  returnId: text("return_id")
    .references(() => taxReturns.id)
    .notNull(),
  status: text("status").default("PENDING").notNull(), // 'PENDING', 'SIGNED', 'PROCESSING'
  content: text("content").notNull(),
  signedAt: integer("signed_at", { mode: "timestamp" }),
  signatureData: text("signature_data"),
  s3Key: text("s3_key"),
  consentAgreed: integer("consent_agreed", { mode: "boolean" }).default(false).notNull(),
  consentElectronic: integer("consent_electronic", { mode: "boolean" }).default(false).notNull(),
  consentResponsibility: integer("consent_responsibility", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  returnIdIdx: index("engagement_letters_return_id_idx").on(table.returnId),
}));

export const engagementLettersRelations = relations(engagementLetters, ({ one }) => ({
  taxReturn: one(taxReturns, {
    fields: [engagementLetters.returnId],
    references: [taxReturns.id],
  }),
}));

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  bookingId: text("booking_id"), // Remote booking ID
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  location: text("location"),
  notes: text("notes"),
  status: text("status").default("SCHEDULED").notNull(), // 'SCHEDULED', 'COMPLETED', 'CANCELLED'
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("appointments_user_id_idx").on(table.userId),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const annualUpdates = sqliteTable("annual_updates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  clientId: text("client_id")
    .references(() => users.id)
    .notNull(),
  returnId: text("return_id")
    .references(() => taxReturns.id)
    .notNull(),
  status: text("status").default("DRAFT").notNull(), // 'DRAFT', 'SUBMITTED'
  taxInfo: text("tax_info"), // JSON string
  dependents: text("dependents"), // JSON string
  bankingInfo: text("banking_info"), // JSON string (contains encrypted fields)
  priorYearChanges: text("prior_year_changes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  clientIdIdx: index("annual_updates_client_id_idx").on(table.clientId),
  returnIdIdx: index("annual_updates_return_id_idx").on(table.returnId),
}));

export const annualUpdatesRelations = relations(annualUpdates, ({ one }) => ({
  client: one(users, {
    fields: [annualUpdates.clientId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [annualUpdates.returnId],
    references: [taxReturns.id],
  }),
}));

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const posts = sqliteTable("posts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  featuredImageUrl: text("featured_image_url"),
  publishDate: integer("publish_date", { mode: "timestamp" }),
  type: text("type").default("blog").notNull(), // 'blog', 'resource'
  status: text("status").default("draft").notNull(), // 'draft', 'published', 'scheduled'
  categoryId: text("category_id")
    .references(() => categories.id)
    .notNull(),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false).notNull(),
  authorId: text("author_id")
    .references(() => users.id)
    .notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  // Social media syndication fields
  socialTitle: text("social_title"),
  socialDescription: text("social_description"),
  socialImage: text("social_image"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  slugIdx: index("posts_slug_idx").on(table.slug),
  statusIdx: index("posts_status_idx").on(table.status),
  categoryIdIdx: index("posts_category_id_idx").on(table.categoryId),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export const qboConnection = sqliteTable("qbo_connection", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }).notNull(),
  realmId: text("realm_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  senderId: text("sender_id").references(() => users.id).notNull(),
  recipientId: text("recipient_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  taxReturnId: text("tax_return_id").references(() => taxReturns.id),
  isRead: integer("is_read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  recipientIdIdx: index("messages_recipient_id_idx").on(table.recipientId),
  taxReturnIdIdx: index("messages_tax_return_id_idx").on(table.taxReturnId),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
  taxReturn: one(taxReturns, {
    fields: [messages.taxReturnId],
    references: [taxReturns.id],
  }),
}));

export const workflows = sqliteTable("workflows", {
  id: text("id").primaryKey(), // Upstash Workflow ID
  name: text("name").notNull(),
  status: text("status").notNull(), // 'running', 'failed', 'successful'
  data: text("data"), // JSON input
  result: text("result"), // JSON output
  error: text("error"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});
