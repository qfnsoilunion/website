import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "DEALER"]);
export const dealerStatusEnum = pgEnum("dealer_status", ["ACTIVE", "INACTIVE"]);
export const employmentStatusEnum = pgEnum("employment_status", ["ACTIVE", "INACTIVE"]);
export const separationTypeEnum = pgEnum("separation_type", ["RESIGNED", "PERFORMANCE", "CONDUCT", "REDUNDANCY", "OTHER"]);
export const clientTypeEnum = pgEnum("client_type", ["PRIVATE", "GOVERNMENT"]);
export const linkStatusEnum = pgEnum("link_status", ["ACTIVE", "INACTIVE"]);
export const transferStatusEnum = pgEnum("transfer_status", ["PENDING", "APPROVED", "REJECTED", "CANCELED"]);

// Tables
export const dealers = pgTable("dealers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  legalName: text("legal_name").notNull(),
  outletName: text("outlet_name").notNull(),
  location: text("location").notNull(),
  status: dealerStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Dealer profiles (login credentials for dealers)
export const dealerProfiles = pgTable("dealer_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealerId: varchar("dealer_id").notNull().unique(),
  username: varchar("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  email: text("email").notNull(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false).notNull(),
  temporaryPassword: boolean("temporary_password").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin credentials table
export const adminAuth = pgTable("admin_auth", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const persons = pgTable("persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aadhaar: varchar("aadhaar", { length: 12 }).unique().notNull(),
  name: text("name").notNull(),
  mobile: varchar("mobile", { length: 15 }),
  email: text("email"),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employmentRecords = pgTable("employment_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull(),
  dealerId: varchar("dealer_id").notNull(),
  dateOfJoining: timestamp("date_of_joining").notNull(),
  dateOfResignation: timestamp("date_of_resignation"),
  currentStatus: employmentStatusEnum("current_status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const separationEvents = pgTable("separation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employmentId: varchar("employment_id").notNull(),
  separationDate: timestamp("separation_date").notNull(),
  separationType: separationTypeEnum("separation_type").notNull(),
  remarks: text("remarks").notNull(),
  recordedByLabel: text("recorded_by_label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientType: clientTypeEnum("client_type").notNull(),
  pan: varchar("pan", { length: 10 }).unique(),
  govClientId: varchar("gov_client_id").unique(),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  mobile: varchar("mobile", { length: 15 }),
  email: text("email"),
  address: text("address"),
  gstin: varchar("gstin", { length: 15 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  registrationNumber: varchar("registration_number").unique().notNull(),
  fuelType: text("fuel_type"),
  notes: text("notes"),
});

export const clientDealerLinks = pgTable("client_dealer_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  dealerId: varchar("dealer_id").notNull(),
  status: linkStatusEnum("status").default("ACTIVE").notNull(),
  dateOfOnboarding: timestamp("date_of_onboarding").notNull(),
  dateOfOffboarding: timestamp("date_of_offboarding"),
  offboardingReason: text("offboarding_reason"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const transferRequests = pgTable("transfer_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  fromDealerId: varchar("from_dealer_id").notNull(),
  toDealerId: varchar("to_dealer_id").notNull(),
  status: transferStatusEnum("status").default("PENDING").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  decidedAt: timestamp("decided_at"),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const dealersRelations = relations(dealers, ({ one, many }) => ({
  profile: one(dealerProfiles, { fields: [dealers.id], references: [dealerProfiles.dealerId] }),
  employments: many(employmentRecords),
  clientLinks: many(clientDealerLinks),
  transfersFrom: many(transferRequests, { relationName: "fromDealer" }),
  transfersTo: many(transferRequests, { relationName: "toDealer" }),
}));

export const dealerProfilesRelations = relations(dealerProfiles, ({ one }) => ({
  dealer: one(dealers, { fields: [dealerProfiles.dealerId], references: [dealers.id] }),
}));

export const personsRelations = relations(persons, ({ many }) => ({
  employments: many(employmentRecords),
}));

export const employmentRecordsRelations = relations(employmentRecords, ({ one, many }) => ({
  person: one(persons, { fields: [employmentRecords.personId], references: [persons.id] }),
  dealer: one(dealers, { fields: [employmentRecords.dealerId], references: [dealers.id] }),
  separations: many(separationEvents),
}));

export const separationEventsRelations = relations(separationEvents, ({ one }) => ({
  employment: one(employmentRecords, { fields: [separationEvents.employmentId], references: [employmentRecords.id] }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles),
  links: many(clientDealerLinks),
  transferRequests: many(transferRequests),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  client: one(clients, { fields: [vehicles.clientId], references: [clients.id] }),
}));

export const clientDealerLinksRelations = relations(clientDealerLinks, ({ one }) => ({
  client: one(clients, { fields: [clientDealerLinks.clientId], references: [clients.id] }),
  dealer: one(dealers, { fields: [clientDealerLinks.dealerId], references: [dealers.id] }),
}));

export const transferRequestsRelations = relations(transferRequests, ({ one }) => ({
  client: one(clients, { fields: [transferRequests.clientId], references: [clients.id] }),
  fromDealer: one(dealers, { fields: [transferRequests.fromDealerId], references: [dealers.id], relationName: "fromDealer" }),
  toDealer: one(dealers, { fields: [transferRequests.toDealerId], references: [dealers.id], relationName: "toDealer" }),
}));

// Schemas
export const insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmploymentRecordSchema = createInsertSchema(employmentRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

export const insertTransferRequestSchema = createInsertSchema(transferRequests).omit({
  id: true,
  createdAt: true,
  decidedAt: true,
});

// Types
export type Dealer = typeof dealers.$inferSelect;
export type InsertDealer = z.infer<typeof insertDealerSchema>;

export type Person = typeof persons.$inferSelect;
export type InsertPerson = z.infer<typeof insertPersonSchema>;

export type EmploymentRecord = typeof employmentRecords.$inferSelect;
export type InsertEmploymentRecord = z.infer<typeof insertEmploymentRecordSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type TransferRequest = typeof transferRequests.$inferSelect;
export type InsertTransferRequest = z.infer<typeof insertTransferRequestSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;

export type DealerProfile = typeof dealerProfiles.$inferSelect;
export type InsertDealerProfile = typeof dealerProfiles.$inferInsert;

export type AdminAuth = typeof adminAuth.$inferSelect;
export type InsertAdminAuth = typeof adminAuth.$inferInsert;
