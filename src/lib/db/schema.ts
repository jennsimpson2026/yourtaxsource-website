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
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  documents: many(documents),
  taxReturns: many(taxReturns),
  invoices: many(invoices),
  annualUpdates: many(annualUpdates),
  posts: many(posts),
  auditLogs: many(auditLogs),
  appointments: many(appointments),
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
  status: text("status").default("NOT_STARTED").notNull(), // 'NOT_STARTED', 'IN_PROGRESS', etc.
  paymentStatus: text("payment_status").default("UNPAID").notNull(),
  assignedStaffId: text("assigned_staff_id").references(() => users.id),
  federalResult: real("federal_result"),
  stateResults: text("state_results"), // JSON string
  manualRelease: integer("manual_release", { mode: "boolean" }).default(false).notNull(),
  isComplimentary: integer("is_complimentary", { mode: "boolean" }).default(false).notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  clientIdIdx: index("tax_returns_client_id_idx").on(table.clientId),
}));

export const taxReturnsRelations = relations(taxReturns, ({ one, many }) => ({
  client: one(users, {
    fields: [taxReturns.clientId],
    references: [users.id],
  }),
  documents: many(documents),
  invoices: many(invoices),
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
  isLocked: integer("is_locked", { mode: "boolean" }).default(true).notNull(),
  uploadedAt: integer("uploaded_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
}, (table) => ({
  userIdIdx: index("documents_user_id_idx").on(table.userId),
  returnIdIdx: index("documents_return_id_idx").on(table.returnId),
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
  metadata: text("metadata"), // JSON string
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`).notNull(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
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
  amount: real("amount").notNull(),
  currency: text("currency").default("USD").notNull(),
  status: text("status").default("UNPAID").notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
}, (table) => ({
  userIdIdx: index("invoices_user_id_idx").on(table.userId),
  returnIdIdx: index("invoices_return_id_idx").on(table.returnId),
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
