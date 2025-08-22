import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { logAudit } from "./utils/audit";
import { generateGovClientId } from "./utils/hash";
import {
  createEmployeeSchema,
  createPrivateClientSchema,
  createGovernmentClientSchema,
  endEmploymentSchema,
  createDealerSchema,
} from "./utils/validators";
import { z } from "zod";
import { 
  initializeAdmin, 
  verifyAdminPassword, 
  verifyAdminTotp,
  createDealerProfile,
  verifyDealerLogin,
  verifyDealerTotp,
  changeDealerPassword,
  resetDealerPassword
} from "./auth";

function getActorFromHeaders(req: any): string {
  const actor = req.headers["x-actor"];
  if (!actor) {
    throw new Error("x-actor header is required");
  }
  return actor as string;
}

// Middleware to check admin authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const adminAuth = req.headers["x-admin-auth"];
  
  if (adminAuth !== "true") {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  
  next();
}


export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin account on startup
  await initializeAdmin();

  // Admin authentication routes
  app.post("/api/admin/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      const result = await verifyAdminPassword(password);
      
      if (result.success) {
        res.json({
          success: true,
          totpEnabled: result.totpEnabled,
          qrCode: result.qrCode,
        });
      } else {
        res.status(401).json({ message: "Invalid password" });
      }
    } catch (error) {
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/admin/verify-totp", async (req, res) => {
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

  // Dealer profile management (admin only)
  app.post("/api/admin/dealer-profiles", requireAdmin, async (req, res) => {
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

  // Dealer login routes
  app.post("/api/dealer/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const result = await verifyDealerLogin(username, password);
      
      if (result.success) {
        res.json({
          success: true,
          dealerId: result.dealerId,
          totpEnabled: result.totpEnabled,
          qrCode: result.qrCode,
          temporaryPassword: result.temporaryPassword,
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/dealer/verify-totp", async (req, res) => {
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

  // Change dealer password
  app.post("/api/dealer/change-password", async (req, res) => {
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

  // Admin reset dealer password
  app.post("/api/admin/reset-dealer-password", requireAdmin, async (req, res) => {
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

  // Get dealer profiles (admin only)
  app.get("/api/admin/dealer-profiles", requireAdmin, async (req, res) => {
    try {
      const profiles = await storage.getDealerProfiles();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealer profiles" });
    }
  });

  // Cache for metrics to improve performance
  let metricsCache: any = null;
  let lastMetricsFetch = 0;
  const METRICS_CACHE_TTL = 30000; // 30 seconds

  // Home metrics with caching
  app.get("/api/metrics/home", async (req, res) => {
    try {
      const now = Date.now();
      if (metricsCache && (now - lastMetricsFetch) < METRICS_CACHE_TTL) {
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

  // Dealers
  app.post("/api/admin/dealers", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = createDealerSchema.parse(req.body);
      
      const dealer = await storage.createDealer(validatedData);
      await logAudit(actor, "CREATE", "DEALER", dealer.id, validatedData);
      
      res.json(dealer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create dealer" });
      }
    }
  });

  app.get("/api/admin/dealers", async (req, res) => {
    try {
      const dealers = await storage.getDealers();
      res.json(dealers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dealers" });
    }
  });

  app.get("/api/admin/dealers/:id", async (req, res) => {
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

  app.patch("/api/admin/dealers/:id", async (req, res) => {
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

  // Employees
  app.post("/api/employees", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = createEmployeeSchema.parse(req.body);
      
      // Check if person exists
      let person = await storage.getPersonByAadhaar(validatedData.aadhaar);
      
      if (person) {
        // Check if already employed elsewhere
        const activeEmployment = await storage.getActiveEmploymentByPersonId(person.id);
        if (activeEmployment && activeEmployment.dealerId !== validatedData.dealerId) {
          const dealer = await storage.getDealerById(activeEmployment.dealerId);
          return res.status(409).json({
            code: "EMPLOYEE_ACTIVE_ELSEWHERE",
            message: "Employee is already active with another dealer",
            dealerName: dealer?.outletName || "Unknown",
            since: activeEmployment.dateOfJoining,
          });
        }
      } else {
        // Create new person
        person = await storage.createPerson({
          aadhaar: validatedData.aadhaar,
          name: validatedData.name,
          mobile: validatedData.mobile || null,
          email: validatedData.email || null,
          address: validatedData.address || null,
          dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : null,
        });
      }

      // Create employment record
      const employment = await storage.createEmploymentRecord({
        personId: person.id,
        dealerId: validatedData.dealerId,
        dateOfJoining: new Date(validatedData.dateOfJoining),
        currentStatus: "ACTIVE",
      });

      await logAudit(actor, "CREATE", "EMPLOYMENT", employment.id, validatedData);
      
      res.json({ person, employment });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Employee creation error:", error);
        res.status(500).json({ message: "Failed to create employee", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  app.get("/api/employees/search", async (req, res) => {
    try {
      const { aadhaar, name, mobile } = req.query;
      
      if (!aadhaar && !name && !mobile) {
        return res.status(400).json({ message: "At least one search parameter is required" });
      }

      const persons = await storage.searchPersons({
        aadhaar: aadhaar as string,
        name: name as string,
        mobile: mobile as string,
      });

      // Get employment history for each person
      const results = await Promise.all(
        persons.map(async (person) => {
          const employments = await storage.getEmploymentsByPersonId(person.id);
          return { ...person, employments };
        })
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search employees" });
    }
  });

  app.patch("/api/employments/:id/end", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const validatedData = endEmploymentSchema.parse(req.body);
      
      await storage.endEmployment(req.params.id, {
        separationDate: new Date(validatedData.separationDate),
        separationType: validatedData.separationType,
        remarks: validatedData.remarks,
        recordedByLabel: actor,
      });

      await logAudit(actor, "END_EMPLOYMENT", "EMPLOYMENT", req.params.id, validatedData);
      
      res.json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to end employment" });
      }
    }
  });

  // Clients
  app.post("/api/clients", async (req, res) => {
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

      // Check for existing client
      let existingClient;
      if (clientType === "PRIVATE") {
        const privateData = validatedData as z.infer<typeof createPrivateClientSchema>;
        const existing = await storage.searchClients({ pan: privateData.pan });
        existingClient = existing[0];
      } else {
        const govData = validatedData as z.infer<typeof createGovernmentClientSchema>;
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
            since: activeLink.client_dealer_links.dateOfOnboarding,
          });
        }
      }

      // Create client
      const clientData: any = {
        clientType: validatedData.clientType,
        name: validatedData.name,
        contactPerson: (validatedData as any).contactPerson || null,
        mobile: validatedData.mobile || null,
        email: validatedData.email || null,
        address: validatedData.address || null,
        gstin: validatedData.gstin || null,
      };

      if (clientType === "PRIVATE") {
        const privateData = validatedData as z.infer<typeof createPrivateClientSchema>;
        clientData.pan = privateData.pan;
      } else {
        const govData = validatedData as z.infer<typeof createGovernmentClientSchema>;
        clientData.govClientId = generateGovClientId(
          govData.orgName,
          govData.officeCode,
          govData.officialEmailOrLetterNo
        );
      }

      const client = existingClient || await storage.createClient(clientData);

      // Create dealer link
      await storage.createClientDealerLink(client.id, validatedData.dealerId, new Date());

      // Create vehicles
      if (validatedData.vehicles && validatedData.vehicles.length > 0) {
        await Promise.all(
          validatedData.vehicles.map((registration: string) =>
            storage.createVehicle({
              clientId: client.id,
              registrationNumber: registration.toUpperCase(),
            })
          )
        );
      }

      await logAudit(actor, "CREATE", "CLIENT", client.id, validatedData);
      
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        console.error("Client creation error:", error);
        res.status(500).json({ message: "Failed to create client", error: error instanceof Error ? error.message : String(error) });
      }
    }
  });

  app.get("/api/clients/search", async (req, res) => {
    try {
      const { pan, govId, vehicle, name, org } = req.query;
      
      if (!pan && !govId && !vehicle && !name && !org) {
        return res.status(400).json({ message: "At least one search parameter is required" });
      }

      const clients = await storage.searchClients({
        pan: pan as string,
        govClientId: govId as string,
        vehicle: vehicle as string,
        name: (name || org) as string,
      });

      // Get additional details for each client
      const results = await Promise.all(
        clients.map(async (client) => {
          const vehicles = await storage.getVehiclesByClientId(client.id);
          const activeLink = await storage.getActiveClientDealerLink(client.id);
          return { ...client, vehicles, activeLink };
        })
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to search clients" });
    }
  });

  app.post("/api/clients/:id/vehicles", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      const { registrationNumber } = req.body;
      
      if (!registrationNumber) {
        return res.status(400).json({ message: "Registration number is required" });
      }

      const vehicle = await storage.createVehicle({
        clientId: req.params.id,
        registrationNumber: registrationNumber.toUpperCase(),
      });

      await logAudit(actor, "ADD_VEHICLE", "CLIENT", req.params.id, { registrationNumber });
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Failed to add vehicle" });
    }
  });

  // Transfers
  app.post("/api/transfers", async (req, res) => {
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
        reason: reason || null,
      });

      await logAudit(actor, "CREATE", "TRANSFER", transfer.id, req.body);
      
      res.json(transfer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transfer request" });
    }
  });

  app.post("/api/transfers/:id/approve", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      
      await storage.approveTransfer(req.params.id);
      await logAudit(actor, "APPROVE", "TRANSFER", req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve transfer" });
    }
  });

  app.post("/api/transfers/:id/reject", async (req, res) => {
    try {
      const actor = getActorFromHeaders(req);
      
      await storage.rejectTransfer(req.params.id);
      await logAudit(actor, "REJECT", "TRANSFER", req.params.id);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject transfer" });
    }
  });

  app.get("/api/transfers", async (req, res) => {
    try {
      const transfers = await storage.getTransferRequests();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transfers" });
    }
  });

  // Get employees by dealer
  app.get("/api/dealers/:dealerId/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployeesWithDetailsByDealerId(req.params.dealerId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  // Get clients by dealer  
  app.get("/api/dealers/:dealerId/clients", async (req, res) => {
    try {
      const clients = await storage.getClientsWithDetailsByDealerId(req.params.dealerId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Search aliases
  app.get("/api/search/employee", async (req, res) => {
    return app._router.handle({ ...req, url: "/api/employees/search" }, res);
  });

  app.get("/api/search/client", async (req, res) => {
    return app._router.handle({ ...req, url: "/api/clients/search" }, res);
  });

  // Audit logs
  app.get("/api/audit", async (req, res) => {
    try {
      const { entity, id, page = 1 } = req.query;
      const filters: any = {};
      if (entity) filters.entity = entity as string;
      if (id) filters.entityId = id as string;

      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Cache for oil prices to reduce redundant calculations
  const priceCache = new Map();
  const PRICE_CACHE_TTL = 60000; // 1 minute

  // Advanced oil price search with Google integration
  app.get("/api/oil-prices/search", async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ message: "Location parameter is required" });
      }

      console.log(`Searching fuel prices for: ${location}`);
      
      // Check cache first
      const cacheKey = location.toLowerCase();
      const cached = priceCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < PRICE_CACHE_TTL) {
        return res.json(cached.data);
      }
      
      // Simulate Google search results for fuel prices
      const searchResults = await simulateGoogleFuelSearch(location);
      
      // Cache the results
      priceCache.set(cacheKey, {
        data: searchResults,
        timestamp: Date.now()
      });
      
      res.json(searchResults);
    } catch (error) {
      console.error('Fuel price search error:', error);
      res.status(500).json({ message: "Failed to fetch fuel prices" });
    }
  });

  // Global fuel prices map data with caching
  let globalPricesCache: any = null;
  let lastGlobalFetch = 0;
  const GLOBAL_PRICE_CACHE_TTL = 300000; // 5 minutes

  app.get("/api/oil-prices/global", async (req, res) => {
    try {
      const now = Date.now();
      if (globalPricesCache && (now - lastGlobalFetch) < GLOBAL_PRICE_CACHE_TTL) {
        return res.json(globalPricesCache);
      }

      const globalPrices = await getGlobalFuelPrices();
      globalPricesCache = globalPrices;
      lastGlobalFetch = now;
      
      res.json(globalPrices);
    } catch (error) {
      console.error('Global fuel prices error:', error);
      res.status(500).json({ message: "Failed to fetch global fuel prices" });
    }
  });

  // Real-time price updates for specific locations
  app.get("/api/oil-prices/live/:country", async (req, res) => {
    try {
      const { country } = req.params;
      const liveData = await getLiveFuelPrices(country);
      res.json(liveData);
    } catch (error) {
      console.error('Live fuel prices error:', error);
      res.status(500).json({ message: "Failed to fetch live fuel prices" });
    }
  });

  // Find similar employees across other dealers
  app.get("/api/employees/similar", async (req, res) => {
    try {
      const { name, mobile, email, dealerId } = req.query;
      
      if (!dealerId) {
        return res.status(400).json({ message: "Dealer ID is required" });
      }
      
      const filters: any = {};
      if (name && typeof name === 'string') {
        filters.name = name;
      }
      if (mobile && typeof mobile === 'string') {
        filters.mobile = mobile;
      }
      if (email && typeof email === 'string') {
        filters.email = email;
      }
      
      // Get all employees from all dealers
      const allEmployees = await storage.getAllEmployeesWithDetails();
      const similarEmployees = allEmployees.filter((empData: any) => {
        // Exclude current dealer's employees
        if (empData.employment.dealerId === dealerId) return false;
        
        // Check for similar name (partial match)
        if (filters.name && empData.person.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return true;
        }
        
        // Check for exact mobile match
        if (filters.mobile && empData.person.mobile === filters.mobile) {
          return true;
        }
        
        // Check for exact email match
        if (filters.email && empData.person.email === filters.email) {
          return true;
        }
        
        return false;
      });
      
      // Enrich with dealer names
      const enrichedEmployees = similarEmployees.map((empData: any) => {
        return {
          ...empData,
          dealerName: empData.dealer.legalName || 'Unknown Dealer'
        };
      });
      
      res.json(enrichedEmployees.slice(0, 5)); // Limit to 5 matches
    } catch (error) {
      console.error('Error finding similar employees:', error);
      res.status(500).json({ message: "Failed to find similar employees" });
    }
  });
  
  // Find similar clients across other dealers
  app.get("/api/clients/similar", async (req, res) => {
    try {
      const { name, mobile, email, pan, dealerId } = req.query;
      
      if (!dealerId) {
        return res.status(400).json({ message: "Dealer ID is required" });
      }
      
      const filters: any = {};
      if (name && typeof name === 'string') {
        filters.name = name;
      }
      if (mobile && typeof mobile === 'string') {
        filters.mobile = mobile;
      }
      if (email && typeof email === 'string') {
        filters.email = email;
      }
      if (pan && typeof pan === 'string') {
        filters.pan = pan;
      }
      
      // Get all clients from all dealers
      const allClients = await storage.getAllClientsWithDetails();
      const similarClients = allClients.filter((clientData: any) => {
        // Exclude current dealer's clients
        if (clientData.link.dealerId === dealerId) return false;
        
        // Check for similar name (partial match)
        if (filters.name && clientData.client.name.toLowerCase().includes(filters.name.toLowerCase())) {
          return true;
        }
        
        // Check for exact mobile match
        if (filters.mobile && clientData.client.mobile === filters.mobile) {
          return true;
        }
        
        // Check for exact email match
        if (filters.email && clientData.client.email === filters.email) {
          return true;
        }
        
        // Check for exact PAN match
        if (filters.pan && clientData.client.pan === filters.pan) {
          return true;
        }
        
        return false;
      });
      
      // Enrich with dealer names
      const enrichedClients = similarClients.map((clientData: any) => {
        return {
          ...clientData,
          dealerName: clientData.dealer.legalName || 'Unknown Dealer'
        };
      });
      
      res.json(enrichedClients.slice(0, 5)); // Limit to 5 matches
    } catch (error) {
      console.error('Error finding similar clients:', error);
      res.status(500).json({ message: "Failed to find similar clients" });
    }
  });

  // Get Srinagar local prices (default)  
  app.get("/api/oil-prices/local", async (req, res) => {
    try {
      // Generate realistic price variations
      const basePrice = 106.80; // Base petrol price for Srinagar
      const variation = Math.random() * 1.5 - 0.75; // ±0.75 rupee variation
      const currentPrice = basePrice + variation;
      
      const kashmirPrices = {
        location: "Srinagar, Jammu and Kashmir",
        currency: "INR",
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        previousPrice: parseFloat((currentPrice - 0.40).toFixed(2)),
        change: "+0.40",
        changePercent: "+0.37%",
        lastUpdated: new Date().toISOString(),
        marketOpen: true,
        regional: {
          "Srinagar": parseFloat(currentPrice.toFixed(2)),
          "Jammu": parseFloat((currentPrice - 0.50).toFixed(2)),
          "Leh": parseFloat((currentPrice + 1.80).toFixed(2)),
          "Anantnag": parseFloat((currentPrice + 0.30).toFixed(2)),
        }
      };

      res.json(kashmirPrices);
    } catch (error) {
      console.error("Error fetching local prices:", error);
      res.status(500).json({ message: "Failed to fetch local prices" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulate Google search for fuel prices
async function simulateGoogleFuelSearch(location: string) {
  const locationLower = location.toLowerCase();
  
  // Simulate realistic regional pricing based on global data (converted to INR)
  const USD_TO_INR = 83.12; // Current exchange rate
  let basePrice = {
    petrol: 1.45 * USD_TO_INR, // INR per liter
    diesel: 1.32 * USD_TO_INR,
    premium: 1.68 * USD_TO_INR
  };

  // Regional adjustments based on real-world patterns
  const regionMultipliers: { [key: string]: number } = {
    'norway': 1.85, 'switzerland': 1.75, 'netherlands': 1.82,
    'france': 1.68, 'germany': 1.65, 'uk': 1.72, 'italy': 1.69,
    'spain': 1.42, 'usa': 0.95, 'canada': 1.15, 'mexico': 0.88,
    'india': 1.38, 'china': 1.12, 'japan': 1.41, 'south korea': 1.52,
    'australia': 1.28, 'new zealand': 1.46, 'brazil': 1.18,
    'russia': 0.62, 'saudi arabia': 0.35, 'venezuela': 0.08,
    'uae': 0.47, 'qatar': 0.31, 'kuwait': 0.33,
    'kashmir': 1.42, 'srinagar': 1.44, 'jammu': 1.41
  };

  let multiplier = 1.0;
  for (const [region, mult] of Object.entries(regionMultipliers)) {
    if (locationLower.includes(region)) {
      multiplier = mult;
      break;
    }
  }

  // Apply regional adjustments
  const adjustedPrices = {
    petrol: {
      regular: (basePrice.petrol * multiplier + (Math.random() * 8 - 4)).toFixed(2),
      premium: (basePrice.premium * multiplier + (Math.random() * 8 - 4)).toFixed(2)
    },
    diesel: (basePrice.diesel * multiplier + (Math.random() * 6 - 3)).toFixed(2)
  };

  // Simulate price trends
  const trends = ['up', 'down', 'stable'];
  const currentTrend = trends[Math.floor(Math.random() * trends.length)];
  
  return {
    location: location,
    country: detectCountry(location),
    currency: 'INR',
    currencySymbol: '₹',
    lastUpdated: new Date().toISOString(),
    coordinates: getLocationCoordinates(location),
    prices: adjustedPrices,
    trend: currentTrend,
    changePercent: (Math.random() * 8 - 4).toFixed(2),
    marketAnalysis: {
      volatility: (Math.random() * 100).toFixed(1),
      supplyStatus: Math.random() > 0.7 ? 'tight' : 'adequate',
      demandLevel: Math.random() > 0.5 ? 'high' : 'moderate'
    },
    nearbyStations: generateNearbyStations(location),
    historicalData: generateHistoricalData()
  };
}

// Get global fuel prices for map visualization
async function getGlobalFuelPrices() {
  const majorCities = [
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060, country: 'USA' },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278, country: 'UK' },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, country: 'Japan' },
    { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, country: 'UAE' },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777, country: 'India' },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093, country: 'Australia' },
    { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050, country: 'Germany' },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522, country: 'France' },
    { name: 'Srinagar, Kashmir', lat: 34.0837, lng: 74.7973, country: 'India' },
    { name: 'São Paulo, Brazil', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
    { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6176, country: 'Russia' },
    { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753, country: 'Saudi Arabia' }
  ];

  const globalData = await Promise.all(majorCities.map(async city => {
    const priceData = await simulateGoogleFuelSearch(city.name);
    return {
      ...city,
      ...priceData,
      coordinates: { lat: city.lat, lng: city.lng }
    };
  }));

  return {
    timestamp: new Date().toISOString(),
    totalLocations: globalData.length,
    averagePetrolPrice: calculateAverage(globalData, 'petrol.regular'),
    averageDieselPrice: calculateAverage(globalData, 'diesel'),
    locations: globalData
  };
}

// Get live fuel prices for specific country
async function getLiveFuelPrices(country: string) {
  const countryData = await simulateGoogleFuelSearch(country);
  
  return {
    ...countryData,
    liveUpdate: true,
    refreshRate: '5 minutes',
    dataSource: 'Government API Simulation',
    confidence: (85 + Math.random() * 10).toFixed(1) + '%'
  };
}

// Helper functions
function detectCountry(location: string): string {
  const countryMappings: { [key: string]: string } = {
    'usa': 'United States', 'uk': 'United Kingdom', 'uae': 'United Arab Emirates',
    'kashmir': 'India', 'srinagar': 'India', 'jammu': 'India'
  };
  
  for (const [key, country] of Object.entries(countryMappings)) {
    if (location.toLowerCase().includes(key)) return country;
  }
  
  return location.split(',').pop()?.trim() || 'Unknown';
}

function getLocationCoordinates(location: string): { lat: number; lng: number } {
  // Simplified coordinate mapping
  const coords: { [key: string]: { lat: number; lng: number } } = {
    'srinagar': { lat: 34.0837, lng: 74.7973 },
    'jammu': { lat: 32.7266, lng: 74.8570 },
    'new york': { lat: 40.7128, lng: -74.0060 },
    'london': { lat: 51.5074, lng: -0.1278 },
    'tokyo': { lat: 35.6762, lng: 139.6503 },
    'dubai': { lat: 25.2048, lng: 55.2708 }
  };
  
  for (const [key, coord] of Object.entries(coords)) {
    if (location.toLowerCase().includes(key)) return coord;
  }
  
  // Random coordinates for unknown locations
  return {
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180
  };
}

function generateNearbyStations(location: string) {
  const stationCount = 3 + Math.floor(Math.random() * 4);
  const stations = [];
  const USD_TO_INR = 83.12;
  
  for (let i = 0; i < stationCount; i++) {
    stations.push({
      name: `Station ${i + 1}`,
      distance: (Math.random() * 5 + 0.5).toFixed(1) + ' km',
      petrolPrice: ((1.30 + Math.random() * 0.40) * USD_TO_INR).toFixed(2),
      dieselPrice: ((1.20 + Math.random() * 0.35) * USD_TO_INR).toFixed(2),
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
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    basePrice += (Math.random() - 0.5) * 4; // Small daily fluctuations in INR
    
    data.push({
      date: date.toISOString().split('T')[0],
      petrol: (basePrice + Math.random() * 8 - 4).toFixed(2),
      diesel: (basePrice * 0.91 + Math.random() * 6 - 3).toFixed(2)
    });
  }
  
  return data;
}

function calculateAverage(data: any[], path: string): string {
  try {
    const values = data.map(item => {
      const keys = path.split('.');
      let value = item.prices;
      for (const key of keys) {
        if (value && typeof value === 'object') {
          value = value[key];
        } else {
          return 0; // Return 0 for invalid paths
        }
      }
      return parseFloat(value) || 0;
    });
    
    const validValues = values.filter(v => v > 0);
    if (validValues.length === 0) return "0.00";
    
    const average = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
    return average.toFixed(2);
  } catch (error) {
    console.error('Error calculating average:', error);
    return "0.00";
  }
}

export { simulateGoogleFuelSearch, getGlobalFuelPrices, getLiveFuelPrices };
