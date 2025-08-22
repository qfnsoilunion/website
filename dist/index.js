var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminAuth: () => adminAuth,
  auditLogs: () => auditLogs,
  clientDealerLinks: () => clientDealerLinks,
  clientDealerLinksRelations: () => clientDealerLinksRelations,
  clientTypeEnum: () => clientTypeEnum,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  dealerProfiles: () => dealerProfiles,
  dealerProfilesRelations: () => dealerProfilesRelations,
  dealerStatusEnum: () => dealerStatusEnum,
  dealers: () => dealers,
  dealersRelations: () => dealersRelations,
  employmentRecords: () => employmentRecords,
  employmentRecordsRelations: () => employmentRecordsRelations,
  employmentStatusEnum: () => employmentStatusEnum,
  insertClientSchema: () => insertClientSchema,
  insertDealerSchema: () => insertDealerSchema,
  insertEmploymentRecordSchema: () => insertEmploymentRecordSchema,
  insertPersonSchema: () => insertPersonSchema,
  insertTransferRequestSchema: () => insertTransferRequestSchema,
  insertVehicleSchema: () => insertVehicleSchema,
  linkStatusEnum: () => linkStatusEnum,
  persons: () => persons,
  personsRelations: () => personsRelations,
  roleEnum: () => roleEnum,
  separationEvents: () => separationEvents,
  separationEventsRelations: () => separationEventsRelations,
  separationTypeEnum: () => separationTypeEnum,
  transferRequests: () => transferRequests,
  transferRequestsRelations: () => transferRequestsRelations,
  transferStatusEnum: () => transferStatusEnum,
  vehicles: () => vehicles,
  vehiclesRelations: () => vehiclesRelations
});
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, pgEnum, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var roleEnum = pgEnum("role", ["ADMIN", "DEALER"]);
var dealerStatusEnum = pgEnum("dealer_status", ["ACTIVE", "INACTIVE"]);
var employmentStatusEnum = pgEnum("employment_status", ["ACTIVE", "INACTIVE"]);
var separationTypeEnum = pgEnum("separation_type", ["RESIGNED", "PERFORMANCE", "CONDUCT", "REDUNDANCY", "OTHER"]);
var clientTypeEnum = pgEnum("client_type", ["PRIVATE", "GOVERNMENT"]);
var linkStatusEnum = pgEnum("link_status", ["ACTIVE", "INACTIVE"]);
var transferStatusEnum = pgEnum("transfer_status", ["PENDING", "APPROVED", "REJECTED", "CANCELED"]);
var dealers = pgTable("dealers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  legalName: text("legal_name").notNull(),
  outletName: text("outlet_name").notNull(),
  location: text("location").notNull(),
  status: dealerStatusEnum("status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var dealerProfiles = pgTable("dealer_profiles", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var adminAuth = pgTable("admin_auth", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret"),
  totpEnabled: boolean("totp_enabled").default(false).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var persons = pgTable("persons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  aadhaar: varchar("aadhaar", { length: 12 }).unique().notNull(),
  name: text("name").notNull(),
  mobile: varchar("mobile", { length: 15 }),
  email: text("email"),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var employmentRecords = pgTable("employment_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  personId: varchar("person_id").notNull(),
  dealerId: varchar("dealer_id").notNull(),
  dateOfJoining: timestamp("date_of_joining").notNull(),
  dateOfResignation: timestamp("date_of_resignation"),
  currentStatus: employmentStatusEnum("current_status").default("ACTIVE").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var separationEvents = pgTable("separation_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employmentId: varchar("employment_id").notNull(),
  separationDate: timestamp("separation_date").notNull(),
  separationType: separationTypeEnum("separation_type").notNull(),
  remarks: text("remarks").notNull(),
  recordedByLabel: text("recorded_by_label").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var clients = pgTable("clients", {
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
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  registrationNumber: varchar("registration_number").unique().notNull(),
  fuelType: text("fuel_type"),
  notes: text("notes")
});
var clientDealerLinks = pgTable("client_dealer_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  dealerId: varchar("dealer_id").notNull(),
  status: linkStatusEnum("status").default("ACTIVE").notNull(),
  dateOfOnboarding: timestamp("date_of_onboarding").notNull(),
  dateOfOffboarding: timestamp("date_of_offboarding"),
  offboardingReason: text("offboarding_reason"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var transferRequests = pgTable("transfer_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: varchar("client_id").notNull(),
  fromDealerId: varchar("from_dealer_id").notNull(),
  toDealerId: varchar("to_dealer_id").notNull(),
  status: transferStatusEnum("status").default("PENDING").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  decidedAt: timestamp("decided_at")
});
var auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var dealersRelations = relations(dealers, ({ one, many }) => ({
  profile: one(dealerProfiles, { fields: [dealers.id], references: [dealerProfiles.dealerId] }),
  employments: many(employmentRecords),
  clientLinks: many(clientDealerLinks),
  transfersFrom: many(transferRequests, { relationName: "fromDealer" }),
  transfersTo: many(transferRequests, { relationName: "toDealer" })
}));
var dealerProfilesRelations = relations(dealerProfiles, ({ one }) => ({
  dealer: one(dealers, { fields: [dealerProfiles.dealerId], references: [dealers.id] })
}));
var personsRelations = relations(persons, ({ many }) => ({
  employments: many(employmentRecords)
}));
var employmentRecordsRelations = relations(employmentRecords, ({ one, many }) => ({
  person: one(persons, { fields: [employmentRecords.personId], references: [persons.id] }),
  dealer: one(dealers, { fields: [employmentRecords.dealerId], references: [dealers.id] }),
  separations: many(separationEvents)
}));
var separationEventsRelations = relations(separationEvents, ({ one }) => ({
  employment: one(employmentRecords, { fields: [separationEvents.employmentId], references: [employmentRecords.id] })
}));
var clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles),
  links: many(clientDealerLinks),
  transferRequests: many(transferRequests)
}));
var vehiclesRelations = relations(vehicles, ({ one }) => ({
  client: one(clients, { fields: [vehicles.clientId], references: [clients.id] })
}));
var clientDealerLinksRelations = relations(clientDealerLinks, ({ one }) => ({
  client: one(clients, { fields: [clientDealerLinks.clientId], references: [clients.id] }),
  dealer: one(dealers, { fields: [clientDealerLinks.dealerId], references: [dealers.id] })
}));
var transferRequestsRelations = relations(transferRequests, ({ one }) => ({
  client: one(clients, { fields: [transferRequests.clientId], references: [clients.id] }),
  fromDealer: one(dealers, { fields: [transferRequests.fromDealerId], references: [dealers.id], relationName: "fromDealer" }),
  toDealer: one(dealers, { fields: [transferRequests.toDealerId], references: [dealers.id], relationName: "toDealer" })
}));
var insertDealerSchema = createInsertSchema(dealers).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertPersonSchema = createInsertSchema(persons).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertEmploymentRecordSchema = createInsertSchema(employmentRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true
});
var insertTransferRequestSchema = createInsertSchema(transferRequests).omit({
  id: true,
  createdAt: true,
  decidedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, and, desc, sql as sql2, count } from "drizzle-orm";
var DatabaseStorage = class {
  async createDealer(dealer) {
    const [created] = await db.insert(dealers).values(dealer).returning();
    return created;
  }
  async getDealers() {
    return await db.select().from(dealers).orderBy(dealers.legalName);
  }
  async getDealerById(id) {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }
  async updateDealerStatus(id, status) {
    const [updated] = await db.update(dealers).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(dealers.id, id)).returning();
    return updated;
  }
  async getDealerProfiles() {
    const results = await db.select({
      id: dealerProfiles.id,
      dealerId: dealerProfiles.dealerId,
      username: dealerProfiles.username,
      passwordHash: dealerProfiles.passwordHash,
      email: dealerProfiles.email,
      mobile: dealerProfiles.mobile,
      totpSecret: dealerProfiles.totpSecret,
      totpEnabled: dealerProfiles.totpEnabled,
      temporaryPassword: dealerProfiles.temporaryPassword,
      lastLogin: dealerProfiles.lastLogin,
      createdAt: dealerProfiles.createdAt,
      updatedAt: dealerProfiles.updatedAt
    }).from(dealerProfiles).orderBy(dealerProfiles.username);
    return results;
  }
  async createPerson(person) {
    const [created] = await db.insert(persons).values(person).returning();
    return created;
  }
  async getPersonByAadhaar(aadhaar) {
    const [person] = await db.select().from(persons).where(eq(persons.aadhaar, aadhaar));
    return person;
  }
  async searchPersons(query) {
    let conditions = [];
    if (query.aadhaar) conditions.push(eq(persons.aadhaar, query.aadhaar));
    if (query.name) conditions.push(sql2`${persons.name} ILIKE ${"%" + query.name + "%"}`);
    if (query.mobile) conditions.push(eq(persons.mobile, query.mobile));
    if (conditions.length === 0) return [];
    return await db.select().from(persons).where(and(...conditions));
  }
  async createEmploymentRecord(employment) {
    const [created] = await db.insert(employmentRecords).values(employment).returning();
    return created;
  }
  async getEmploymentsByDealerId(dealerId) {
    return await db.select().from(employmentRecords).where(eq(employmentRecords.dealerId, dealerId));
  }
  async getEmploymentsByPersonId(personId) {
    return await db.select().from(employmentRecords).where(eq(employmentRecords.personId, personId));
  }
  async getActiveEmploymentByPersonId(personId) {
    const [employment] = await db.select().from(employmentRecords).where(and(
      eq(employmentRecords.personId, personId),
      eq(employmentRecords.currentStatus, "ACTIVE")
    ));
    return employment;
  }
  async endEmployment(employmentId, separationData) {
    await db.transaction(async (tx) => {
      await tx.update(employmentRecords).set({
        currentStatus: "INACTIVE",
        dateOfResignation: separationData.separationDate,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(employmentRecords.id, employmentId));
      await tx.insert(separationEvents).values({
        employmentId,
        separationDate: separationData.separationDate,
        separationType: separationData.separationType,
        remarks: separationData.remarks,
        recordedByLabel: separationData.recordedByLabel
      });
    });
  }
  async createClient(client) {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }
  async getClientById(id) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  async searchClients(query) {
    let conditions = [];
    if (query.pan) conditions.push(eq(clients.pan, query.pan));
    if (query.govClientId) conditions.push(eq(clients.govClientId, query.govClientId));
    if (query.name) conditions.push(sql2`${clients.name} ILIKE ${"%" + query.name + "%"}`);
    if (query.vehicle) {
      const results = await db.select({ clients }).from(clients).innerJoin(vehicles, eq(clients.id, vehicles.clientId)).where(sql2`${vehicles.registrationNumber} ILIKE ${"%" + query.vehicle + "%"}`);
      return results.map((r) => r.clients);
    }
    if (conditions.length === 0) return [];
    return await db.select().from(clients).where(and(...conditions));
  }
  async getActiveClientDealerLink(clientId) {
    const [link] = await db.select().from(clientDealerLinks).innerJoin(dealers, eq(clientDealerLinks.dealerId, dealers.id)).where(and(
      eq(clientDealerLinks.clientId, clientId),
      eq(clientDealerLinks.status, "ACTIVE")
    ));
    return link;
  }
  async createClientDealerLink(clientId, dealerId, dateOfOnboarding) {
    await db.insert(clientDealerLinks).values({
      clientId,
      dealerId,
      dateOfOnboarding,
      status: "ACTIVE"
    });
  }
  async createVehicle(vehicle) {
    const [created] = await db.insert(vehicles).values(vehicle).returning();
    return created;
  }
  async getVehiclesByClientId(clientId) {
    return await db.select().from(vehicles).where(eq(vehicles.clientId, clientId));
  }
  async createTransferRequest(transfer) {
    const [created] = await db.insert(transferRequests).values(transfer).returning();
    return created;
  }
  async getTransferRequests() {
    return await db.select().from(transferRequests).orderBy(desc(transferRequests.createdAt));
  }
  async approveTransfer(transferId) {
    await db.transaction(async (tx) => {
      const [transfer] = await tx.select().from(transferRequests).where(eq(transferRequests.id, transferId));
      if (!transfer) throw new Error("Transfer request not found");
      await tx.update(clientDealerLinks).set({
        status: "INACTIVE",
        dateOfOffboarding: /* @__PURE__ */ new Date(),
        offboardingReason: "TRANSFER",
        updatedAt: /* @__PURE__ */ new Date()
      }).where(and(
        eq(clientDealerLinks.clientId, transfer.clientId),
        eq(clientDealerLinks.dealerId, transfer.fromDealerId),
        eq(clientDealerLinks.status, "ACTIVE")
      ));
      await tx.insert(clientDealerLinks).values({
        clientId: transfer.clientId,
        dealerId: transfer.toDealerId,
        dateOfOnboarding: /* @__PURE__ */ new Date(),
        status: "ACTIVE"
      });
      await tx.update(transferRequests).set({ status: "APPROVED", decidedAt: /* @__PURE__ */ new Date() }).where(eq(transferRequests.id, transferId));
    });
  }
  async rejectTransfer(transferId) {
    await db.update(transferRequests).set({ status: "REJECTED", decidedAt: /* @__PURE__ */ new Date() }).where(eq(transferRequests.id, transferId));
  }
  async getHomeMetrics() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [
      activeDealersResult,
      activeEmployeesResult,
      activeClientsResult,
      todaysJoinsResult,
      todaysSeparationsResult
    ] = await Promise.all([
      db.select({ count: count() }).from(dealers).where(eq(dealers.status, "ACTIVE")),
      db.select({ count: count() }).from(employmentRecords).where(eq(employmentRecords.currentStatus, "ACTIVE")),
      db.select({ count: count() }).from(clientDealerLinks).where(eq(clientDealerLinks.status, "ACTIVE")),
      db.select({ count: count() }).from(employmentRecords).where(
        and(
          sql2`${employmentRecords.dateOfJoining} >= ${today}`,
          sql2`${employmentRecords.dateOfJoining} < ${tomorrow}`
        )
      ),
      db.select({ count: count() }).from(separationEvents).where(
        and(
          sql2`${separationEvents.separationDate} >= ${today}`,
          sql2`${separationEvents.separationDate} < ${tomorrow}`
        )
      )
    ]);
    return {
      activeDealers: activeDealersResult[0]?.count || 0,
      activeEmployees: activeEmployeesResult[0]?.count || 0,
      activeClients: activeClientsResult[0]?.count || 0,
      todaysJoins: todaysJoinsResult[0]?.count || 0,
      todaysSeparations: todaysSeparationsResult[0]?.count || 0
    };
  }
  async createAuditLog(log2) {
    const [created] = await db.insert(auditLogs).values(log2).returning();
    return created;
  }
  async getAuditLogs(filters) {
    let conditions = [];
    if (filters?.entity) conditions.push(eq(auditLogs.entity, filters.entity));
    if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));
    const query = conditions.length > 0 ? db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)) : db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
    return await query;
  }
  async getEmployeesWithDetailsByDealerId(dealerId) {
    const results = await db.select({
      employment: employmentRecords,
      person: persons,
      dealer: dealers
    }).from(employmentRecords).innerJoin(persons, eq(employmentRecords.personId, persons.id)).innerJoin(dealers, eq(employmentRecords.dealerId, dealers.id)).where(eq(employmentRecords.dealerId, dealerId)).orderBy(desc(employmentRecords.createdAt));
    return results;
  }
  async getClientsWithDetailsByDealerId(dealerId) {
    const results = await db.select({
      client: clients,
      link: clientDealerLinks,
      vehicles: sql2`COALESCE(JSON_AGG(${vehicles}.*) FILTER (WHERE ${vehicles.id} IS NOT NULL), '[]')`
    }).from(clientDealerLinks).innerJoin(clients, eq(clientDealerLinks.clientId, clients.id)).leftJoin(vehicles, eq(clients.id, vehicles.clientId)).where(and(
      eq(clientDealerLinks.dealerId, dealerId),
      eq(clientDealerLinks.status, "ACTIVE")
    )).groupBy(clients.id, clientDealerLinks.id).orderBy(desc(clientDealerLinks.createdAt));
    return results;
  }
  async getAllEmployeesWithDetails() {
    const results = await db.select({
      employment: employmentRecords,
      person: persons,
      dealer: dealers
    }).from(employmentRecords).innerJoin(persons, eq(employmentRecords.personId, persons.id)).innerJoin(dealers, eq(employmentRecords.dealerId, dealers.id)).orderBy(desc(employmentRecords.createdAt));
    return results;
  }
  async getAllClientsWithDetails() {
    const results = await db.select({
      client: clients,
      link: clientDealerLinks,
      vehicles: sql2`COALESCE(JSON_AGG(${vehicles}.*) FILTER (WHERE ${vehicles.id} IS NOT NULL), '[]')`,
      dealer: dealers
    }).from(clientDealerLinks).innerJoin(clients, eq(clientDealerLinks.clientId, clients.id)).innerJoin(dealers, eq(clientDealerLinks.dealerId, dealers.id)).leftJoin(vehicles, eq(clients.id, vehicles.clientId)).where(eq(clientDealerLinks.status, "ACTIVE")).groupBy(clients.id, clientDealerLinks.id, dealers.id).orderBy(desc(clientDealerLinks.createdAt));
    return results;
  }
};
var storage = new DatabaseStorage();

// server/utils/audit.ts
async function logAudit(actor, action, entity, entityId, metadata) {
  await storage.createAuditLog({
    actor,
    action,
    entity,
    entityId,
    metadata
  });
}

// server/utils/hash.ts
import { createHash } from "crypto";
function generateGovClientId(orgName, officeCode, officialEmailOrLetterNo) {
  const input = `${orgName}${officeCode}${officialEmailOrLetterNo}`;
  return createHash("sha256").update(input).digest("hex").substring(0, 16).toUpperCase();
}

// server/utils/validators.ts
import { z } from "zod";
var aadhaarSchema = z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits");
var panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format");
var vehicleSchema = z.string().min(1, "Vehicle registration required");
var createEmployeeSchema = z.object({
  aadhaar: aadhaarSchema,
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dealerId: z.string().min(1, "Dealer ID required"),
  dateOfJoining: z.string().min(1, "Date of joining required")
});
var createPrivateClientSchema = z.object({
  clientType: z.literal("PRIVATE"),
  pan: panSchema,
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  vehicles: z.array(vehicleSchema).min(1, "At least one vehicle required"),
  dealerId: z.string().min(1, "Dealer ID required")
});
var createGovernmentClientSchema = z.object({
  clientType: z.literal("GOVERNMENT"),
  name: z.string().min(1, "Organization name is required"),
  contactPerson: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  orgName: z.string().min(1, "Organization name required"),
  officeCode: z.string().min(1, "Office code required"),
  officialEmailOrLetterNo: z.string().min(1, "Official email or letter number required"),
  vehicles: z.array(vehicleSchema).optional(),
  dealerId: z.string().min(1, "Dealer ID required")
});
var endEmploymentSchema = z.object({
  separationDate: z.string().min(1, "Separation date required"),
  separationType: z.enum(["RESIGNED", "PERFORMANCE", "CONDUCT", "REDUNDANCY", "OTHER"]),
  remarks: z.string().min(1, "Remarks are required")
});
var createDealerSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  outletName: z.string().min(1, "Outlet name is required"),
  location: z.string().min(1, "Location is required")
});

// server/routes.ts
import { z as z2 } from "zod";

// server/auth.ts
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { eq as eq2 } from "drizzle-orm";
var ADMIN_USERNAME = "admin";
var ADMIN_PASSWORD = "Union@2025";
async function initializeAdmin() {
  try {
    const [existingAdmin] = await db.select().from(adminAuth).where(eq2(adminAuth.username, ADMIN_USERNAME));
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const secret = speakeasy.generateSecret({
        name: `Union Registry Admin`,
        length: 32
      });
      await db.insert(adminAuth).values({
        username: ADMIN_USERNAME,
        passwordHash,
        totpSecret: secret.base32,
        totpEnabled: false
      });
      console.log("Admin account initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize admin account:", error);
  }
}
async function verifyAdminPassword(password) {
  try {
    const [admin] = await db.select().from(adminAuth).where(eq2(adminAuth.username, ADMIN_USERNAME));
    if (!admin) {
      return { success: false };
    }
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isValid) {
      return { success: false };
    }
    if (!admin.totpEnabled && admin.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: admin.totpSecret,
        label: `Union Registry Admin`,
        issuer: "Union Registry",
        encoding: "base32"
      });
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return { success: true, totpEnabled: false, qrCode };
    }
    return { success: true, totpEnabled: admin.totpEnabled };
  } catch (error) {
    console.error("Password verification error:", error);
    return { success: false };
  }
}
async function verifyAdminTotp(code, enableTotp = false) {
  try {
    const [admin] = await db.select().from(adminAuth).where(eq2(adminAuth.username, ADMIN_USERNAME));
    if (!admin || !admin.totpSecret) {
      return false;
    }
    const verified = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: code,
      window: 2
    });
    if (verified && enableTotp && !admin.totpEnabled) {
      await db.update(adminAuth).set({ totpEnabled: true, lastLogin: /* @__PURE__ */ new Date() }).where(eq2(adminAuth.username, ADMIN_USERNAME));
    } else if (verified) {
      await db.update(adminAuth).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq2(adminAuth.username, ADMIN_USERNAME));
    }
    return verified;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return false;
  }
}
async function createDealerProfile(dealerId, username, password, email, mobile) {
  try {
    const [existingProfile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.username, username));
    if (existingProfile) {
      return { success: false, error: "Username already exists" };
    }
    const [existingDealerProfile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.dealerId, dealerId));
    if (existingDealerProfile) {
      return { success: false, error: "Dealer already has a profile" };
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({
      name: `Union Registry - ${username}`,
      length: 32
    });
    await db.insert(dealerProfiles).values({
      dealerId,
      username,
      passwordHash,
      email,
      mobile,
      totpSecret: secret.base32,
      totpEnabled: false,
      temporaryPassword: true
    });
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: username,
      issuer: "Union Registry",
      encoding: "base32"
    });
    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return { success: true, qrCode };
  } catch (error) {
    console.error("Failed to create dealer profile:", error);
    return { success: false, error: "Failed to create profile" };
  }
}
async function verifyDealerLogin(username, password) {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.username, username));
    if (!profile) {
      return { success: false };
    }
    const isValid = await bcrypt.compare(password, profile.passwordHash);
    if (!isValid) {
      return { success: false };
    }
    if (!profile.totpEnabled && profile.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: profile.totpSecret,
        label: username,
        issuer: "Union Registry",
        encoding: "base32"
      });
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      return {
        success: true,
        dealerId: profile.dealerId,
        totpEnabled: false,
        qrCode,
        temporaryPassword: profile.temporaryPassword
      };
    }
    return {
      success: true,
      dealerId: profile.dealerId,
      totpEnabled: profile.totpEnabled,
      temporaryPassword: profile.temporaryPassword
    };
  } catch (error) {
    console.error("Dealer login error:", error);
    return { success: false };
  }
}
async function verifyDealerTotp(username, code, enableTotp = false) {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.username, username));
    if (!profile || !profile.totpSecret) {
      return { success: false };
    }
    const verified = speakeasy.totp.verify({
      secret: profile.totpSecret,
      encoding: "base32",
      token: code,
      window: 2
    });
    if (verified && enableTotp && !profile.totpEnabled) {
      await db.update(dealerProfiles).set({ totpEnabled: true, lastLogin: /* @__PURE__ */ new Date() }).where(eq2(dealerProfiles.username, username));
    } else if (verified) {
      await db.update(dealerProfiles).set({ lastLogin: /* @__PURE__ */ new Date() }).where(eq2(dealerProfiles.username, username));
    }
    return { success: verified, dealerId: verified ? profile.dealerId : void 0 };
  } catch (error) {
    console.error("Dealer TOTP verification error:", error);
    return { success: false };
  }
}
async function changeDealerPassword(username, newPassword) {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.username, username));
    if (!profile) {
      return { success: false, error: "Dealer profile not found" };
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(dealerProfiles).set({
      passwordHash,
      temporaryPassword: false,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(dealerProfiles.username, username));
    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error: "Failed to change password" };
  }
}
async function resetDealerPassword(dealerId) {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq2(dealerProfiles.dealerId, dealerId));
    if (!profile) {
      return { success: false, error: "Dealer profile not found" };
    }
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newPassword = "";
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.update(dealerProfiles).set({
      passwordHash,
      temporaryPassword: true,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq2(dealerProfiles.dealerId, dealerId));
    return { success: true, newPassword };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}

// server/routes.ts
function getActorFromHeaders(req) {
  const actor = req.headers["x-actor"];
  if (!actor) {
    throw new Error("x-actor header is required");
  }
  return actor;
}
function requireAdmin(req, res, next) {
  const adminAuth2 = req.headers["x-admin-auth"];
  if (adminAuth2 !== "true") {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
}
async function registerRoutes(app2) {
  await initializeAdmin();
  app2.post("/api/admin/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      const result = await verifyAdminPassword(password);
      if (result.success) {
        res.json({
          success: true,
          totpEnabled: result.totpEnabled,
          qrCode: result.qrCode
        });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });
  app2.post("/api/admin/verify-totp", async (req, res) => {
    try {
      const { code, enableTotp } = req.body;
      const verified = await verifyAdminTotp(code, enableTotp);
      if (verified) {
        res.json({ success: true });
      } else {
        res.status(401).json({ message: "Invalid 2FA code" });
      }
    } catch (error) {
      res.status(500).json({ message: "2FA verification failed" });
    }
  });
  app2.post("/api/admin/dealer-profiles", requireAdmin, async (req, res) => {
    try {
      const { dealerId, username, password, email, mobile } = req.body;
      const result = await createDealerProfile(dealerId, username, password, email, mobile);
      if (result.success) {
        res.json({
          success: true,
          qrCode: result.qrCode,
          message: "Dealer profile created successfully"
        });
      } else {
        res.status(400).json({ message: result.error || "Failed to create profile" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to create dealer profile" });
    }
  });
  app2.post("/api/dealer/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await verifyDealerLogin(username, password);
      if (result.success) {
        res.json({
          success: true,
          dealerId: result.dealerId,
          totpEnabled: result.totpEnabled,
          qrCode: result.qrCode,
          temporaryPassword: result.temporaryPassword
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/dealer/verify-totp", async (req, res) => {
    try {
      const { username, code, enableTotp } = req.body;
      const result = await verifyDealerTotp(username, code, enableTotp);
      if (result.success) {
        res.json({ success: true, dealerId: result.dealerId });
      } else {
        res.status(401).json({ message: "Invalid 2FA code" });
      }
    } catch (error) {
      res.status(500).json({ message: "2FA verification failed" });
    }
  });
  app2.post("/api/dealer/change-password", async (req, res) => {
    try {
      const { username, newPassword } = req.body;
      const result = await changeDealerPassword(username, newPassword);
      if (result.success) {
        res.json({ success: true, message: "Password changed successfully" });
      } else {
        res.status(400).json({ message: result.error || "Failed to change password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Password change failed" });
    }
  });
  app2.post("/api/admin/reset-dealer-password", requireAdmin, async (req, res) => {
    try {
      const { dealerId } = req.body;
      const result = await resetDealerPassword(dealerId);
      if (result.success) {
        res.json({
          success: true,
          newPassword: result.newPassword,
          message: "Password reset successfully"
        });
      } else {
        res.status(400).json({ message: result.error || "Failed to reset password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Password reset failed" });
    }
  });
  app2.get("/api/admin/dealer-profiles", requireAdmin, async (req, res) => {
    try {
      const profiles = await storage.getDealerProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer profiles" });
    }
  });
  let metricsCache = null;
  let lastMetricsFetch = 0;
  const METRICS_CACHE_TTL = 3e4;
  app2.get("/api/metrics/home", async (req, res) => {
    try {
      const now = Date.now();
      if (metricsCache && now - lastMetricsFetch < METRICS_CACHE_TTL) {
        return res.json(metricsCache);
      }
      const metrics = await storage.getHomeMetrics();
      metricsCache = metrics;
      lastMetricsFetch = now;
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  app2.post("/api/admin/dealers", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = createDealerSchema.parse(req.body);
      const dealer = await storage.createDealer(validatedData);
      await logAudit(actor, "CREATE", "DEALER", dealer.id, validatedData);
      res.json(dealer);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create dealer" });
      }
    }
  });
  app2.get("/api/admin/dealers", async (req, res) => {
    try {
      const dealers2 = await storage.getDealers();
      res.json(dealers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });
  app2.get("/api/admin/dealers/:id", async (req, res) => {
    try {
      const dealer = await storage.getDealerById(req.params.id);
      if (!dealer) {
        return res.status(404).json({ message: "Dealer not found" });
      }
      res.json(dealer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer" });
    }
  });
  app2.patch("/api/admin/dealers/:id", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const { status } = req.body;
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const dealer = await storage.updateDealerStatus(req.params.id, status);
      await logAudit(actor, "UPDATE", "DEALER", dealer.id, { status });
      res.json(dealer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update dealer" });
    }
  });
  app2.post("/api/employees", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = createEmployeeSchema.parse(req.body);
      let person = await storage.getPersonByAadhaar(validatedData.aadhaar);
      if (person) {
        const activeEmployment = await storage.getActiveEmploymentByPersonId(person.id);
        if (activeEmployment && activeEmployment.dealerId !== validatedData.dealerId) {
          const dealer = await storage.getDealerById(activeEmployment.dealerId);
          return res.status(409).json({
            code: "EMPLOYEE_ACTIVE_ELSEWHERE",
            message: "Employee is already active with another dealer",
            dealerName: dealer?.outletName || "Unknown",
            since: activeEmployment.dateOfJoining
          });
        }
      } else {
        person = await storage.createPerson({
          aadhaar: validatedData.aadhaar,
          name: validatedData.name,
          mobile: validatedData.mobile || null,
          email: validatedData.email || null,
          address: validatedData.address || null,
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null
        });
      }
      const employment = await storage.createEmploymentRecord({
        personId: person.id,
        dealerId: validatedData.dealerId,
        dateOfJoining: new Date(validatedData.dateOfJoining),
        currentStatus: "ACTIVE"
      });
      await logAudit(actor, "CREATE", "EMPLOYMENT", employment.id, validatedData);
      res.json({ person, employment });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Employee creation error:", error);
        res.status(500).json({ message: "Failed to create employee", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });
  app2.get("/api/employees/search", async (req, res) => {
    try {
      const { aadhaar, name, mobile } = req.query;
      if (!aadhaar && !name && !mobile) {
        return res.status(400).json({ message: "At least one search parameter is required" });
      }
      const persons2 = await storage.searchPersons({
        aadhaar,
        name,
        mobile
      });
      const results = await Promise.all(
        persons2.map(async (person) => {
          const employments = await storage.getEmploymentsByPersonId(person.id);
          return { ...person, employments };
        })
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search employees" });
    }
  });
  app2.patch("/api/employments/:id/end", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = endEmploymentSchema.parse(req.body);
      await storage.endEmployment(req.params.id, {
        separationDate: new Date(validatedData.separationDate),
        separationType: validatedData.separationType,
        remarks: validatedData.remarks,
        recordedByLabel: actor
      });
      await logAudit(actor, "END_EMPLOYMENT", "EMPLOYMENT", req.params.id, validatedData);
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to end employment" });
      }
    }
  });
  app2.post("/api/clients", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const { clientType } = req.body;
      let validatedData;
      if (clientType === "PRIVATE") {
        validatedData = createPrivateClientSchema.parse(req.body);
      } else if (clientType === "GOVERNMENT") {
        validatedData = createGovernmentClientSchema.parse(req.body);
      } else {
        return res.status(400).json({ message: "Invalid client type" });
      }
      let existingClient;
      if (clientType === "PRIVATE") {
        const privateData = validatedData;
        const existing = await storage.searchClients({ pan: privateData.pan });
        existingClient = existing[0];
      } else {
        const govData = validatedData;
        const govClientId = generateGovClientId(
          govData.orgName,
          govData.officeCode,
          govData.officialEmailOrLetterNo
        );
        const existing = await storage.searchClients({ govClientId });
        existingClient = existing[0];
      }
      if (existingClient) {
        const activeLink = await storage.getActiveClientDealerLink(existingClient.id);
        if (activeLink) {
          return res.status(409).json({
            code: "CLIENT_ACTIVE_ELSEWHERE",
            message: "Client is already active with another dealer",
            dealerName: activeLink.dealers.outletName,
            since: activeLink.client_dealer_links.dateOfOnboarding
          });
        }
      }
      const clientData = {
        clientType: validatedData.clientType,
        name: validatedData.name,
        contactPerson: validatedData.contactPerson || null,
        mobile: validatedData.mobile || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        gstin: validatedData.gstin || null
      };
      if (clientType === "PRIVATE") {
        const privateData = validatedData;
        clientData.pan = privateData.pan;
      } else {
        const govData = validatedData;
        clientData.govClientId = generateGovClientId(
          govData.orgName,
          govData.officeCode,
          govData.officialEmailOrLetterNo
        );
      }
      const client = existingClient || await storage.createClient(clientData);
      await storage.createClientDealerLink(client.id, validatedData.dealerId, /* @__PURE__ */ new Date());
      if (validatedData.vehicles && validatedData.vehicles.length > 0) {
        await Promise.all(
          validatedData.vehicles.map(
            (registration) => storage.createVehicle({
              clientId: client.id,
              registrationNumber: registration.toUpperCase()
            })
          )
        );
      }
      await logAudit(actor, "CREATE", "CLIENT", client.id, validatedData);
      res.json(client);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Client creation error:", error);
        res.status(500).json({ message: "Failed to create client", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });
  app2.get("/api/clients/search", async (req, res) => {
    try {
      const { pan, govId, vehicle, name, org } = req.query;
      if (!pan && !govId && !vehicle && !name && !org) {
        return res.status(400).json({ message: "At least one search parameter is required" });
      }
      const clients2 = await storage.searchClients({
        pan,
        govClientId: govId,
        vehicle,
        name: name || org
      });
      const results = await Promise.all(
        clients2.map(async (client) => {
          const vehicles2 = await storage.getVehiclesByClientId(client.id);
          const activeLink = await storage.getActiveClientDealerLink(client.id);
          return { ...client, vehicles: vehicles2, activeLink };
        })
      );
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search clients" });
    }
  });
  app2.post("/api/clients/:id/vehicles", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const { registrationNumber } = req.body;
      if (!registrationNumber) {
        return res.status(400).json({ message: "Registration number is required" });
      }
      const vehicle = await storage.createVehicle({
        clientId: req.params.id,
        registrationNumber: registrationNumber.toUpperCase()
      });
      await logAudit(actor, "ADD_VEHICLE", "CLIENT", req.params.id, { registrationNumber });
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to add vehicle" });
    }
  });
  app2.post("/api/transfers", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const { clientId, fromDealerId, toDealerId, reason } = req.body;
      if (!clientId || !fromDealerId || !toDealerId) {
        return res.status(400).json({ message: "Client ID, from dealer ID, and to dealer ID are required" });
      }
      const transfer = await storage.createTransferRequest({
        clientId,
        fromDealerId,
        toDealerId,
        reason: reason || null
      });
      await logAudit(actor, "CREATE", "TRANSFER", transfer.id, req.body);
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transfer request" });
    }
  });
  app2.post("/api/transfers/:id/approve", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      await storage.approveTransfer(req.params.id);
      await logAudit(actor, "APPROVE", "TRANSFER", req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve transfer" });
    }
  });
  app2.post("/api/transfers/:id/reject", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      await storage.rejectTransfer(req.params.id);
      await logAudit(actor, "REJECT", "TRANSFER", req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject transfer" });
    }
  });
  app2.get("/api/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransferRequests();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });
  app2.get("/api/dealers/:dealerId/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployeesWithDetailsByDealerId(req.params.dealerId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  app2.get("/api/dealers/:dealerId/clients", async (req, res) => {
    try {
      const clients2 = await storage.getClientsWithDetailsByDealerId(req.params.dealerId);
      res.json(clients2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.get("/api/search/employee", async (req, res) => {
    return app2._router.handle({ ...req, url: "/api/employees/search" }, res);
  });
  app2.get("/api/search/client", async (req, res) => {
    return app2._router.handle({ ...req, url: "/api/clients/search" }, res);
  });
  app2.get("/api/audit", async (req, res) => {
    try {
      const { entity, id, page = 1 } = req.query;
      const filters = {};
      if (entity) filters.entity = entity;
      if (id) filters.entityId = id;
      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  const priceCache = /* @__PURE__ */ new Map();
  const PRICE_CACHE_TTL = 6e4;
  app2.get("/api/oil-prices/search", async (req, res) => {
    try {
      const { location } = req.query;
      if (!location || typeof location !== "string") {
        return res.status(400).json({ message: "Location parameter is required" });
      }
      console.log(`Searching fuel prices for: ${location}`);
      const cacheKey = location.toLowerCase();
      const cached = priceCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
        return res.json(cached.data);
      }
      const searchResults = await simulateGoogleFuelSearch(location);
      priceCache.set(cacheKey, {
        data: searchResults,
        timestamp: Date.now()
      });
      res.json(searchResults);
    } catch (error) {
      console.error("Fuel price search error:", error);
      res.status(500).json({ message: "Failed to fetch fuel prices" });
    }
  });
  let globalPricesCache = null;
  let lastGlobalFetch = 0;
  const GLOBAL_PRICE_CACHE_TTL = 3e5;
  app2.get("/api/oil-prices/global", async (req, res) => {
    try {
      const now = Date.now();
      if (globalPricesCache && now - lastGlobalFetch < GLOBAL_PRICE_CACHE_TTL) {
        return res.json(globalPricesCache);
      }
      const globalPrices = await getGlobalFuelPrices();
      globalPricesCache = globalPrices;
      lastGlobalFetch = now;
      res.json(globalPrices);
    } catch (error) {
      console.error("Global fuel prices error:", error);
      res.status(500).json({ message: "Failed to fetch global fuel prices" });
    }
  });
  app2.get("/api/oil-prices/live/:country", async (req, res) => {
    try {
      const { country } = req.params;
      const liveData = await getLiveFuelPrices(country);
      res.json(liveData);
    } catch (error) {
      console.error("Live fuel prices error:", error);
      res.status(500).json({ message: "Failed to fetch live fuel prices" });
    }
  });
  app2.get("/api/employees/similar", async (req, res) => {
    try {
      const { name, mobile, email, dealerId } = req.query;
      if (!dealerId) {
        return res.status(400).json({ message: "Dealer ID is required" });
      }
      const filters = {};
      if (name && typeof name === "string") {
        filters.name = name;
      }
      if (mobile && typeof mobile === "string") {
        filters.mobile = mobile;
      }
      if (email && typeof email === "string") {
        filters.email = email;
      }
      const allEmployees = await storage.getAllEmployeesWithDetails();
      const similarEmployees = allEmployees.filter((empData) => {
        if (empData.employment.dealerId === dealerId) return false;
        if (filters.name && empData.person.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return true;
        }
        if (filters.mobile && empData.person.mobile === filters.mobile) {
          return true;
        }
        if (filters.email && empData.person.email === filters.email) {
          return true;
        }
        return false;
      });
      const enrichedEmployees = similarEmployees.map((empData) => {
        return {
          ...empData,
          dealerName: empData.dealer.legalName || "Unknown Dealer"
        };
      });
      res.json(enrichedEmployees.slice(0, 5));
    } catch (error) {
      console.error("Error finding similar employees:", error);
      res.status(500).json({ message: "Failed to find similar employees" });
    }
  });
  app2.get("/api/clients/similar", async (req, res) => {
    try {
      const { name, mobile, email, pan, dealerId } = req.query;
      if (!dealerId) {
        return res.status(400).json({ message: "Dealer ID is required" });
      }
      const filters = {};
      if (name && typeof name === "string") {
        filters.name = name;
      }
      if (mobile && typeof mobile === "string") {
        filters.mobile = mobile;
      }
      if (email && typeof email === "string") {
        filters.email = email;
      }
      if (pan && typeof pan === "string") {
        filters.pan = pan;
      }
      const allClients = await storage.getAllClientsWithDetails();
      const similarClients = allClients.filter((clientData) => {
        if (clientData.link.dealerId === dealerId) return false;
        if (filters.name && clientData.client.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return true;
        }
        if (filters.mobile && clientData.client.mobile === filters.mobile) {
          return true;
        }
        if (filters.email && clientData.client.email === filters.email) {
          return true;
        }
        if (filters.pan && clientData.client.pan === filters.pan) {
          return true;
        }
        return false;
      });
      const enrichedClients = similarClients.map((clientData) => {
        return {
          ...clientData,
          dealerName: clientData.dealer.legalName || "Unknown Dealer"
        };
      });
      res.json(enrichedClients.slice(0, 5));
    } catch (error) {
      console.error("Error finding similar clients:", error);
      res.status(500).json({ message: "Failed to find similar clients" });
    }
  });
  app2.get("/api/oil-prices/local", async (req, res) => {
    try {
      const basePrice = 106.8;
      const variation = Math.random() * 1.5 - 0.75;
      const currentPrice = basePrice + variation;
      const kashmirPrices = {
        location: "Srinagar, Jammu and Kashmir",
        currency: "INR",
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        previousPrice: parseFloat((currentPrice - 0.4).toFixed(2)),
        change: "+0.40",
        changePercent: "+0.37%",
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
        marketOpen: true,
        regional: {
          "Srinagar": parseFloat(currentPrice.toFixed(2)),
          "Jammu": parseFloat((currentPrice - 0.5).toFixed(2)),
          "Leh": parseFloat((currentPrice + 1.8).toFixed(2)),
          "Anantnag": parseFloat((currentPrice + 0.3).toFixed(2))
        }
      };
      res.json(kashmirPrices);
    } catch (error) {
      console.error("Error fetching local prices:", error);
      res.status(500).json({ message: "Failed to fetch local prices" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
async function simulateGoogleFuelSearch(location) {
  const locationLower = location.toLowerCase();
  const USD_TO_INR = 83.12;
  let basePrice = {
    petrol: 1.45 * USD_TO_INR,
    // INR per liter
    diesel: 1.32 * USD_TO_INR,
    premium: 1.68 * USD_TO_INR
  };
  const regionMultipliers = {
    "norway": 1.85,
    "switzerland": 1.75,
    "netherlands": 1.82,
    "france": 1.68,
    "germany": 1.65,
    "uk": 1.72,
    "italy": 1.69,
    "spain": 1.42,
    "usa": 0.95,
    "canada": 1.15,
    "mexico": 0.88,
    "india": 1.38,
    "china": 1.12,
    "japan": 1.41,
    "south korea": 1.52,
    "australia": 1.28,
    "new zealand": 1.46,
    "brazil": 1.18,
    "russia": 0.62,
    "saudi arabia": 0.35,
    "venezuela": 0.08,
    "uae": 0.47,
    "qatar": 0.31,
    "kuwait": 0.33,
    "kashmir": 1.42,
    "srinagar": 1.44,
    "jammu": 1.41
  };
  let multiplier = 1;
  for (const [region, mult] of Object.entries(regionMultipliers)) {
    if (locationLower.includes(region)) {
      multiplier = mult;
      break;
    }
  }
  const adjustedPrices = {
    petrol: {
      regular: (basePrice.petrol * multiplier + (Math.random() * 8 - 4)).toFixed(2),
      premium: (basePrice.premium * multiplier + (Math.random() * 8 - 4)).toFixed(2)
    },
    diesel: (basePrice.diesel * multiplier + (Math.random() * 6 - 3)).toFixed(2)
  };
  const trends = ["up", "down", "stable"];
  const currentTrend = trends[Math.floor(Math.random() * trends.length)];
  return {
    location,
    country: detectCountry(location),
    currency: "INR",
    currencySymbol: "\u20B9",
    lastUpdated: (/* @__PURE__ */ new Date()).toISOString(),
    coordinates: getLocationCoordinates(location),
    prices: adjustedPrices,
    trend: currentTrend,
    changePercent: (Math.random() * 8 - 4).toFixed(2),
    marketAnalysis: {
      volatility: (Math.random() * 100).toFixed(1),
      supplyStatus: Math.random() > 0.7 ? "tight" : "adequate",
      demandLevel: Math.random() > 0.5 ? "high" : "moderate"
    },
    nearbyStations: generateNearbyStations(location),
    historicalData: generateHistoricalData()
  };
}
async function getGlobalFuelPrices() {
  const majorCities = [
    { name: "New York, USA", lat: 40.7128, lng: -74.006, country: "USA" },
    { name: "London, UK", lat: 51.5074, lng: -0.1278, country: "UK" },
    { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, country: "Japan" },
    { name: "Dubai, UAE", lat: 25.2048, lng: 55.2708, country: "UAE" },
    { name: "Mumbai, India", lat: 19.076, lng: 72.8777, country: "India" },
    { name: "Sydney, Australia", lat: -33.8688, lng: 151.2093, country: "Australia" },
    { name: "Berlin, Germany", lat: 52.52, lng: 13.405, country: "Germany" },
    { name: "Paris, France", lat: 48.8566, lng: 2.3522, country: "France" },
    { name: "Srinagar, Kashmir", lat: 34.0837, lng: 74.7973, country: "India" },
    { name: "S\xE3o Paulo, Brazil", lat: -23.5505, lng: -46.6333, country: "Brazil" },
    { name: "Moscow, Russia", lat: 55.7558, lng: 37.6176, country: "Russia" },
    { name: "Riyadh, Saudi Arabia", lat: 24.7136, lng: 46.6753, country: "Saudi Arabia" }
  ];
  const globalData = await Promise.all(majorCities.map(async (city) => {
    const priceData = await simulateGoogleFuelSearch(city.name);
    return {
      ...city,
      ...priceData,
      coordinates: { lat: city.lat, lng: city.lng }
    };
  }));
  return {
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    totalLocations: globalData.length,
    averagePetrolPrice: calculateAverage(globalData, "petrol.regular"),
    averageDieselPrice: calculateAverage(globalData, "diesel"),
    locations: globalData
  };
}
async function getLiveFuelPrices(country) {
  const countryData = await simulateGoogleFuelSearch(country);
  return {
    ...countryData,
    liveUpdate: true,
    refreshRate: "5 minutes",
    dataSource: "Government API Simulation",
    confidence: (85 + Math.random() * 10).toFixed(1) + "%"
  };
}
function detectCountry(location) {
  const countryMappings = {
    "usa": "United States",
    "uk": "United Kingdom",
    "uae": "United Arab Emirates",
    "kashmir": "India",
    "srinagar": "India",
    "jammu": "India"
  };
  for (const [key, country] of Object.entries(countryMappings)) {
    if (location.toLowerCase().includes(key)) return country;
  }
  return location.split(",").pop()?.trim() || "Unknown";
}
function getLocationCoordinates(location) {
  const coords = {
    "srinagar": { lat: 34.0837, lng: 74.7973 },
    "jammu": { lat: 32.7266, lng: 74.857 },
    "new york": { lat: 40.7128, lng: -74.006 },
    "london": { lat: 51.5074, lng: -0.1278 },
    "tokyo": { lat: 35.6762, lng: 139.6503 },
    "dubai": { lat: 25.2048, lng: 55.2708 }
  };
  for (const [key, coord] of Object.entries(coords)) {
    if (location.toLowerCase().includes(key)) return coord;
  }
  return {
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180
  };
}
function generateNearbyStations(location) {
  const stationCount = 3 + Math.floor(Math.random() * 4);
  const stations = [];
  const USD_TO_INR = 83.12;
  for (let i = 0; i < stationCount; i++) {
    stations.push({
      name: `Station ${i + 1}`,
      distance: (Math.random() * 5 + 0.5).toFixed(1) + " km",
      petrolPrice: ((1.3 + Math.random() * 0.4) * USD_TO_INR).toFixed(2),
      dieselPrice: ((1.2 + Math.random() * 0.35) * USD_TO_INR).toFixed(2),
      rating: (3.5 + Math.random() * 1.5).toFixed(1)
    });
  }
  return stations;
}
function generateHistoricalData() {
  const data = [];
  const days = 30;
  const USD_TO_INR = 83.12;
  let basePrice = 1.45 * USD_TO_INR;
  for (let i = days; i >= 0; i--) {
    const date = /* @__PURE__ */ new Date();
    date.setDate(date.getDate() - i);
    basePrice += (Math.random() - 0.5) * 4;
    data.push({
      date: date.toISOString().split("T")[0],
      petrol: (basePrice + Math.random() * 8 - 4).toFixed(2),
      diesel: (basePrice * 0.91 + Math.random() * 6 - 3).toFixed(2)
    });
  }
  return data;
}
function calculateAverage(data, path3) {
  try {
    const values = data.map((item) => {
      const keys = path3.split(".");
      let value = item.prices;
      for (const key of keys) {
        if (value && typeof value === "object") {
          value = value[key];
        } else {
          return 0;
        }
      }
      return parseFloat(value) || 0;
    });
    const validValues = values.filter((v) => v > 0);
    if (validValues.length === 0) return "0.00";
    const average = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    return average.toFixed(2);
  } catch (error) {
    console.error("Error calculating average:", error);
    return "0.00";
  }
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
