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
  zip: text("zip"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

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
  stateResult: real("state_result"),
  taxPrepFee: real("tax_prep_fee").default(0).notNull(),
  hasBusinessIncome: integer("has_business_income", { mode: "boolean" }).default(false).notNull(),
  hasRentalIncome: integer("has_rental_income", { mode: "boolean" }).default(false).notNull(),
  hasStockSales: integer("has_stock_sales", { mode: "boolean" }).default(false).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  clientIdIdx: index("tax_returns_client_id_idx").on(table.clientId),
  statusIdx: index("tax_returns_status_idx").on(table.status),
}));

export const taxReturnsRelations = relations(taxReturns, ({ one, many }) => ({
  client: one(users, {
    fields: [taxReturns.clientId],
    references: [users.id],
  }),
  assignedStaff: one(users, {
    fields: [taxReturns.assignedStaffId],
    references: [users.id],
  }),
  documents: many(documents),
  invoices: many(invoices),
}));

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  taxReturnId: text("tax_return_id").references(() => taxReturns.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'W2', '1099', 'FINAL_RETURN', etc.
  url: text("url").notNull(),
  status: text("status").default("PENDING").notNull(), // 'PENDING', 'APPROVED', 'REJECTED'
  isLocked: integer("is_locked", { mode: "boolean" }).default(false).notNull(), // For Pay-to-Unlock
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("documents_user_id_idx").on(table.userId),
  taxReturnIdIdx: index("documents_tax_return_id_idx").on(table.taxReturnId),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [documents.taxReturnId],
    references: [taxReturns.id],
  }),
}));

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  taxReturnId: text("tax_return_id")
    .references(() => taxReturns.id)
    .notNull(),
  amount: real("amount").notNull(),
  status: text("status").default("UNPAID").notNull(), // 'UNPAID', 'PAID', 'CANCELLED'
  description: text("description"),
  externalInvoiceId: text("external_invoice_id"), // For Helcim/Stripe/QBO sync
  paymentUrl: text("payment_url"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("invoices_user_id_idx").on(table.userId),
  taxReturnIdIdx: index("invoices_tax_return_id_idx").on(table.taxReturnId),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  taxReturn: one(taxReturns, {
    fields: [invoices.taxReturnId],
    references: [taxReturns.id],
  }),
}));

export const annualUpdates = sqliteTable("annual_updates", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .references(() => users.id)
    .notNull(),
  year: integer("year").notNull(),
  status: text("status").default("DRAFT").notNull(), // 'DRAFT', 'SUBMITTED', 'REVIEWED'
  data: text("data").notNull(), // JSON blob for flexible questionnaire
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("annual_updates_user_id_idx").on(table.userId),
}));

export const annualUpdatesRelations = relations(annualUpdates, ({ one }) => ({
  user: one(users, {
    fields: [annualUpdates.userId],
    references: [users.id],
  }),
}));

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
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
  fileUrl: text("file_url"),
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

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const appointments = sqliteTable("appointments", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  status: text("status").default("scheduled").notNull(), // 'scheduled', 'cancelled', 'completed'
  externalEventId: text("external_event_id"), // Microsoft Graph Event ID
  type: text("type").default("tax_consultation").notNull(),
  meetingUrl: text("meeting_url"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));
