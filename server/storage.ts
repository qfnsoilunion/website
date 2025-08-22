import {
  dealers,
  dealerProfiles,
  persons,
  employmentRecords,
  separationEvents,
  clients,
  vehicles,
  clientDealerLinks,
  transferRequests,
  auditLogs,
  type Dealer,
  type DealerProfile,
  type Person,
  type EmploymentRecord,
  type Client,
  type Vehicle,
  type TransferRequest,
  type AuditLog,
  type InsertDealer,
  type InsertPerson,
  type InsertEmploymentRecord,
  type InsertClient,
  type InsertVehicle,
  type InsertTransferRequest,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

export interface IStorage {
  // Dealers
  createDealer(dealer: InsertDealer): Promise<Dealer>;
  getDealers(): Promise<Dealer[]>;
  getDealerById(id: string): Promise<Dealer | undefined>;
  updateDealerStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<Dealer>;
  getDealerProfiles(): Promise<DealerProfile[]>;

  // Persons & Employment
  createPerson(person: InsertPerson): Promise<Person>;
  getPersonByAadhaar(aadhaar: string): Promise<Person | undefined>;
  searchPersons(query: { aadhaar?: string; name?: string; mobile?: string }): Promise<Person[]>;
  createEmploymentRecord(employment: InsertEmploymentRecord): Promise<EmploymentRecord>;
  getEmploymentsByDealerId(dealerId: string): Promise<EmploymentRecord[]>;
  getEmploymentsByPersonId(personId: string): Promise<EmploymentRecord[]>;
  getActiveEmploymentByPersonId(personId: string): Promise<EmploymentRecord | undefined>;
  getEmployeesWithDetailsByDealerId(dealerId: string): Promise<any[]>;
  getAllEmployeesWithDetails(): Promise<any[]>;
  endEmployment(employmentId: string, separationData: {
    separationDate: Date;
    separationType: "RESIGNED" | "PERFORMANCE" | "CONDUCT" | "REDUNDANCY" | "OTHER";
    remarks: string;
    recordedByLabel: string;
  }): Promise<void>;

  // Clients
  createClient(client: InsertClient): Promise<Client>;
  getClientById(id: string): Promise<Client | undefined>;
  searchClients(query: { pan?: string; govClientId?: string; name?: string; vehicle?: string }): Promise<Client[]>;
  getActiveClientDealerLink(clientId: string): Promise<any>;
  createClientDealerLink(clientId: string, dealerId: string, dateOfOnboarding: Date): Promise<void>;
  getClientsWithDetailsByDealerId(dealerId: string): Promise<any[]>;
  getAllClientsWithDetails(): Promise<any[]>;

  // Vehicles
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  getVehiclesByClientId(clientId: string): Promise<Vehicle[]>;

  // Transfers
  createTransferRequest(transfer: InsertTransferRequest): Promise<TransferRequest>;
  getTransferRequests(): Promise<TransferRequest[]>;
  approveTransfer(transferId: string): Promise<void>;
  rejectTransfer(transferId: string): Promise<void>;

  // Metrics
  getHomeMetrics(): Promise<{
    activeDealers: number;
    activeEmployees: number;
    activeClients: number;
    todaysJoins: number;
    todaysSeparations: number;
  }>;

  // Audit
  createAuditLog(log: {
    actor: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: any;
  }): Promise<AuditLog>;
  getAuditLogs(filters?: { entity?: string; entityId?: string }): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  async createDealer(dealer: InsertDealer): Promise<Dealer> {
    const [created] = await db.insert(dealers).values(dealer).returning();
    return created;
  }

  async getDealers(): Promise<Dealer[]> {
    return await db.select().from(dealers).orderBy(dealers.legalName);
  }

  async getDealerById(id: string): Promise<Dealer | undefined> {
    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    return dealer;
  }

  async updateDealerStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<Dealer> {
    const [updated] = await db
      .update(dealers)
      .set({ status, updatedAt: new Date() })
      .where(eq(dealers.id, id))
      .returning();
    return updated;
  }

  async getDealerProfiles(): Promise<DealerProfile[]> {
    const results = await db
      .select({
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
        updatedAt: dealerProfiles.updatedAt,
      })
      .from(dealerProfiles)
      .orderBy(dealerProfiles.username);
    return results;
  }

  async createPerson(person: InsertPerson): Promise<Person> {
    const [created] = await db.insert(persons).values(person).returning();
    return created;
  }

  async getPersonByAadhaar(aadhaar: string): Promise<Person | undefined> {
    const [person] = await db.select().from(persons).where(eq(persons.aadhaar, aadhaar));
    return person;
  }

  async searchPersons(query: { aadhaar?: string; name?: string; mobile?: string }): Promise<Person[]> {
    let conditions = [];
    if (query.aadhaar) conditions.push(eq(persons.aadhaar, query.aadhaar));
    if (query.name) conditions.push(sql`${persons.name} ILIKE ${'%' + query.name + '%'}`);
    if (query.mobile) conditions.push(eq(persons.mobile, query.mobile));

    if (conditions.length === 0) return [];
    
    return await db.select().from(persons).where(and(...conditions));
  }

  async createEmploymentRecord(employment: InsertEmploymentRecord): Promise<EmploymentRecord> {
    const [created] = await db.insert(employmentRecords).values(employment).returning();
    return created;
  }

  async getEmploymentsByDealerId(dealerId: string): Promise<EmploymentRecord[]> {
    return await db.select().from(employmentRecords).where(eq(employmentRecords.dealerId, dealerId));
  }

  async getEmploymentsByPersonId(personId: string): Promise<EmploymentRecord[]> {
    return await db.select().from(employmentRecords).where(eq(employmentRecords.personId, personId));
  }

  async getActiveEmploymentByPersonId(personId: string): Promise<EmploymentRecord | undefined> {
    const [employment] = await db
      .select()
      .from(employmentRecords)
      .where(and(
        eq(employmentRecords.personId, personId),
        eq(employmentRecords.currentStatus, "ACTIVE")
      ));
    return employment;
  }

  async endEmployment(employmentId: string, separationData: {
    separationDate: Date;
    separationType: "RESIGNED" | "PERFORMANCE" | "CONDUCT" | "REDUNDANCY" | "OTHER";
    remarks: string;
    recordedByLabel: string;
  }): Promise<void> {
    await db.transaction(async (tx) => {
      // Update employment record
      await tx
        .update(employmentRecords)
        .set({
          currentStatus: "INACTIVE",
          dateOfResignation: separationData.separationDate,
          updatedAt: new Date(),
        })
        .where(eq(employmentRecords.id, employmentId));

      // Create separation event
      await tx.insert(separationEvents).values({
        employmentId,
        separationDate: separationData.separationDate,
        separationType: separationData.separationType,
        remarks: separationData.remarks,
        recordedByLabel: separationData.recordedByLabel,
      });
    });
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [created] = await db.insert(clients).values(client).returning();
    return created;
  }

  async getClientById(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async searchClients(query: { pan?: string; govClientId?: string; name?: string; vehicle?: string }): Promise<Client[]> {
    let conditions = [];
    if (query.pan) conditions.push(eq(clients.pan, query.pan));
    if (query.govClientId) conditions.push(eq(clients.govClientId, query.govClientId));
    if (query.name) conditions.push(sql`${clients.name} ILIKE ${'%' + query.name + '%'}`);

    if (query.vehicle) {
      const results = await db
        .select({ clients })
        .from(clients)
        .innerJoin(vehicles, eq(clients.id, vehicles.clientId))
        .where(sql`${vehicles.registrationNumber} ILIKE ${'%' + query.vehicle + '%'}`);
      return results.map(r => r.clients);
    }

    if (conditions.length === 0) return [];
    
    return await db.select().from(clients).where(and(...conditions));
  }

  async getActiveClientDealerLink(clientId: string): Promise<any> {
    const [link] = await db
      .select()
      .from(clientDealerLinks)
      .innerJoin(dealers, eq(clientDealerLinks.dealerId, dealers.id))
      .where(and(
        eq(clientDealerLinks.clientId, clientId),
        eq(clientDealerLinks.status, "ACTIVE")
      ));
    return link;
  }

  async createClientDealerLink(clientId: string, dealerId: string, dateOfOnboarding: Date): Promise<void> {
    await db.insert(clientDealerLinks).values({
      clientId,
      dealerId,
      dateOfOnboarding,
      status: "ACTIVE",
    });
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const [created] = await db.insert(vehicles).values(vehicle).returning();
    return created;
  }

  async getVehiclesByClientId(clientId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.clientId, clientId));
  }

  async createTransferRequest(transfer: InsertTransferRequest): Promise<TransferRequest> {
    const [created] = await db.insert(transferRequests).values(transfer).returning();
    return created;
  }

  async getTransferRequests(): Promise<TransferRequest[]> {
    return await db.select().from(transferRequests).orderBy(desc(transferRequests.createdAt));
  }

  async approveTransfer(transferId: string): Promise<void> {
    await db.transaction(async (tx) => {
      // Get transfer request
      const [transfer] = await tx
        .select()
        .from(transferRequests)
        .where(eq(transferRequests.id, transferId));

      if (!transfer) throw new Error("Transfer request not found");

      // Update old link
      await tx
        .update(clientDealerLinks)
        .set({
          status: "INACTIVE",
          dateOfOffboarding: new Date(),
          offboardingReason: "TRANSFER",
          updatedAt: new Date(),
        })
        .where(and(
          eq(clientDealerLinks.clientId, transfer.clientId),
          eq(clientDealerLinks.dealerId, transfer.fromDealerId),
          eq(clientDealerLinks.status, "ACTIVE")
        ));

      // Create new link
      await tx.insert(clientDealerLinks).values({
        clientId: transfer.clientId,
        dealerId: transfer.toDealerId,
        dateOfOnboarding: new Date(),
        status: "ACTIVE",
      });

      // Update transfer status
      await tx
        .update(transferRequests)
        .set({ status: "APPROVED", decidedAt: new Date() })
        .where(eq(transferRequests.id, transferId));
    });
  }

  async rejectTransfer(transferId: string): Promise<void> {
    await db
      .update(transferRequests)
      .set({ status: "REJECTED", decidedAt: new Date() })
      .where(eq(transferRequests.id, transferId));
  }

  async getHomeMetrics(): Promise<{
    activeDealers: number;
    activeEmployees: number;
    activeClients: number;
    todaysJoins: number;
    todaysSeparations: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      activeDealersResult,
      activeEmployeesResult,
      activeClientsResult,
      todaysJoinsResult,
      todaysSeparationsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(dealers).where(eq(dealers.status, "ACTIVE")),
      db.select({ count: count() }).from(employmentRecords).where(eq(employmentRecords.currentStatus, "ACTIVE")),
      db.select({ count: count() }).from(clientDealerLinks).where(eq(clientDealerLinks.status, "ACTIVE")),
      db.select({ count: count() }).from(employmentRecords).where(
        and(
          sql`${employmentRecords.dateOfJoining} >= ${today}`,
          sql`${employmentRecords.dateOfJoining} < ${tomorrow}`
        )
      ),
      db.select({ count: count() }).from(separationEvents).where(
        and(
          sql`${separationEvents.separationDate} >= ${today}`,
          sql`${separationEvents.separationDate} < ${tomorrow}`
        )
      ),
    ]);

    return {
      activeDealers: activeDealersResult[0]?.count || 0,
      activeEmployees: activeEmployeesResult[0]?.count || 0,
      activeClients: activeClientsResult[0]?.count || 0,
      todaysJoins: todaysJoinsResult[0]?.count || 0,
      todaysSeparations: todaysSeparationsResult[0]?.count || 0,
    };
  }

  async createAuditLog(log: {
    actor: string;
    action: string;
    entity: string;
    entityId: string;
    metadata?: any;
  }): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async getAuditLogs(filters?: { entity?: string; entityId?: string }): Promise<AuditLog[]> {
    let conditions = [];
    if (filters?.entity) conditions.push(eq(auditLogs.entity, filters.entity));
    if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));

    const query = conditions.length > 0 
      ? db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt))
      : db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));

    return await query;
  }

  async getEmployeesWithDetailsByDealerId(dealerId: string): Promise<any[]> {
    const results = await db
      .select({
        employment: employmentRecords,
        person: persons,
        dealer: dealers,
      })
      .from(employmentRecords)
      .innerJoin(persons, eq(employmentRecords.personId, persons.id))
      .innerJoin(dealers, eq(employmentRecords.dealerId, dealers.id))
      .where(eq(employmentRecords.dealerId, dealerId))
      .orderBy(desc(employmentRecords.createdAt));

    return results;
  }

  async getClientsWithDetailsByDealerId(dealerId: string): Promise<any[]> {
    const results = await db
      .select({
        client: clients,
        link: clientDealerLinks,
        vehicles: sql<Vehicle[]>`COALESCE(JSON_AGG(${vehicles}.*) FILTER (WHERE ${vehicles.id} IS NOT NULL), '[]')`,
      })
      .from(clientDealerLinks)
      .innerJoin(clients, eq(clientDealerLinks.clientId, clients.id))
      .leftJoin(vehicles, eq(clients.id, vehicles.clientId))
      .where(and(
        eq(clientDealerLinks.dealerId, dealerId),
        eq(clientDealerLinks.status, "ACTIVE")
      ))
      .groupBy(clients.id, clientDealerLinks.id)
      .orderBy(desc(clientDealerLinks.createdAt));

    return results;
  }

  async getAllEmployeesWithDetails(): Promise<any[]> {
    const results = await db
      .select({
        employment: employmentRecords,
        person: persons,
        dealer: dealers,
      })
      .from(employmentRecords)
      .innerJoin(persons, eq(employmentRecords.personId, persons.id))
      .innerJoin(dealers, eq(employmentRecords.dealerId, dealers.id))
      .orderBy(desc(employmentRecords.createdAt));

    return results;
  }

  async getAllClientsWithDetails(): Promise<any[]> {
    const results = await db
      .select({
        client: clients,
        link: clientDealerLinks,
        vehicles: sql<Vehicle[]>`COALESCE(JSON_AGG(${vehicles}.*) FILTER (WHERE ${vehicles.id} IS NOT NULL), '[]')`,
        dealer: dealers,
      })
      .from(clientDealerLinks)
      .innerJoin(clients, eq(clientDealerLinks.clientId, clients.id))
      .innerJoin(dealers, eq(clientDealerLinks.dealerId, dealers.id))
      .leftJoin(vehicles, eq(clients.id, vehicles.clientId))
      .where(eq(clientDealerLinks.status, "ACTIVE"))
      .groupBy(clients.id, clientDealerLinks.id, dealers.id)
      .orderBy(desc(clientDealerLinks.createdAt));

    return results;
  }
}

export const storage = new DatabaseStorage();
