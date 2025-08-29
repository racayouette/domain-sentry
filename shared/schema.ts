import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const registrars = pgTable("registrars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  loginUrl: text("login_url"),
  loginUsername: text("login_username"),
  loginPassword: text("login_password"),
  twoFactorMobile: text("two_factor_mobile"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const domains = pgTable("domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  registrarId: varchar("registrar_id").notNull().references(() => registrars.id),
  expiryDate: timestamp("expiry_date").notNull(),
  renewalPeriodYears: integer("renewal_period_years").default(1).notNull(),
  autoRenewal: boolean("auto_renewal").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  nextNotificationDate: timestamp("next_notification_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sslCertificates = pgTable("ssl_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domain: text("domain").notNull(),
  issuer: text("issuer").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  renewalPeriodYears: integer("renewal_period_years").default(1).notNull(),
  autoRenewal: boolean("auto_renewal").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  nextNotificationDate: timestamp("next_notification_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'domain' | 'ssl'
  itemId: varchar("item_id").notNull(),
  itemName: text("item_name").notNull(),
  notificationType: text("notification_type").notNull(), // '30_days' | '14_days' | '7_days' | '1_day'
  expiryDate: timestamp("expiry_date").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const registrarsRelations = relations(registrars, ({ many }) => ({
  domains: many(domains),
}));

export const domainsRelations = relations(domains, ({ one }) => ({
  registrar: one(registrars, {
    fields: [domains.registrarId],
    references: [registrars.id],
  }),
}));

// Insert schemas
export const insertRegistrarSchema = createInsertSchema(registrars).omit({
  id: true,
  createdAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
  completedAt: true,
  nextNotificationDate: true,
});

export const insertSslCertificateSchema = createInsertSchema(sslCertificates).omit({
  id: true,
  createdAt: true,
  isCompleted: true,
  completedAt: true,
  nextNotificationDate: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type Registrar = typeof registrars.$inferSelect;
export type InsertRegistrar = z.infer<typeof insertRegistrarSchema>;

export type Domain = typeof domains.$inferSelect;
export type InsertDomain = z.infer<typeof insertDomainSchema>;

export type SslCertificate = typeof sslCertificates.$inferSelect;
export type InsertSslCertificate = z.infer<typeof insertSslCertificateSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Legacy user schema for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
