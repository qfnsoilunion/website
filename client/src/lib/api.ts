import { apiRequest } from "./queryClient";

export interface HomeMetrics {
  activeDealers: number;
  activeEmployees: number;
  activeClients: number;
  todaysJoins: number;
  todaysSeparations: number;
}

export interface Dealer {
  id: string;
  legalName: string;
  outletName: string;
  location: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Person {
  id: string;
  aadhaar: string;
  name: string;
  mobile: string | null;
  email: string | null;
  address: string | null;
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmploymentRecord {
  id: string;
  personId: string;
  dealerId: string;
  dateOfJoining: string;
  dateOfResignation: string | null;
  currentStatus: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  clientType: "PRIVATE" | "GOVERNMENT";
  pan: string | null;
  govClientId: string | null;
  name: string;
  contactPerson: string | null;
  mobile: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  clientId: string;
  registrationNumber: string;
  fuelType: string | null;
  notes: string | null;
}

export interface TransferRequest {
  id: string;
  clientId: string;
  fromDealerId: string;
  toDealerId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELED";
  reason: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export const api = {
  // Metrics
  getHomeMetrics: async (): Promise<HomeMetrics> => {
    const res = await apiRequest("GET", "/api/metrics/home");
    return res.json();
  },

  // Dealers
  createDealer: async (data: {
    legalName: string;
    outletName: string;
    location: string;
  }): Promise<Dealer> => {
    const res = await apiRequest("POST", "/api/admin/dealers", data);
    return res.json();
  },

  getDealers: async (): Promise<Dealer[]> => {
    const res = await apiRequest("GET", "/api/admin/dealers");
    return res.json();
  },

  getDealerById: async (id: string): Promise<Dealer> => {
    const res = await apiRequest("GET", `/api/admin/dealers/${id}`);
    return res.json();
  },

  updateDealerStatus: async (id: string, status: "ACTIVE" | "INACTIVE"): Promise<Dealer> => {
    const res = await apiRequest("PATCH", `/api/admin/dealers/${id}`, { status });
    return res.json();
  },

  // Employees
  createEmployee: async (data: {
    aadhaar: string;
    name: string;
    mobile?: string;
    email?: string;
    address?: string;
    dateOfBirth?: string;
    dealerId: string;
    dateOfJoining: string;
  }): Promise<{ person: Person; employment: EmploymentRecord }> => {
    const res = await apiRequest("POST", "/api/employees", data);
    return res.json();
  },

  searchEmployees: async (queryString: string): Promise<any[]> => {
    const res = await apiRequest("GET", `/api/employees/search?${queryString}`);
    return res.json();
  },

  searchClients: async (queryString: string): Promise<Client[]> => {
    const res = await apiRequest("GET", `/api/clients/search?${queryString}`);
    return res.json();
  },

  endEmployment: async (employmentId: string, data: {
    separationDate: string;
    separationType: "RESIGNED" | "PERFORMANCE" | "CONDUCT" | "REDUNDANCY" | "OTHER";
    remarks: string;
  }): Promise<{ success: boolean }> => {
    const res = await apiRequest("PATCH", `/api/employments/${employmentId}/end`, data);
    return res.json();
  },

  // Clients
  createClient: async (data: any): Promise<Client> => {
    const res = await apiRequest("POST", "/api/clients", data);
    return res.json();
  },



  addVehicle: async (clientId: string, registrationNumber: string): Promise<Vehicle> => {
    const res = await apiRequest("POST", `/api/clients/${clientId}/vehicles`, {
      registrationNumber,
    });
    return res.json();
  },

  // Transfers
  createTransferRequest: async (data: {
    clientId: string;
    fromDealerId: string;
    toDealerId: string;
    reason?: string;
  }): Promise<TransferRequest> => {
    const res = await apiRequest("POST", "/api/transfers", data);
    return res.json();
  },

  getTransferRequests: async (): Promise<TransferRequest[]> => {
    const res = await apiRequest("GET", "/api/transfers");
    return res.json();
  },

  approveTransfer: async (transferId: string): Promise<{ success: boolean }> => {
    const res = await apiRequest("POST", `/api/transfers/${transferId}/approve`);
    return res.json();
  },

  rejectTransfer: async (transferId: string): Promise<{ success: boolean }> => {
    const res = await apiRequest("POST", `/api/transfers/${transferId}/reject`);
    return res.json();
  },

  // Audit logs
  getAuditLogs: async (filters?: {
    entity?: string;
    id?: string;
    page?: number;
  }): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters?.entity) params.append("entity", filters.entity);
    if (filters?.id) params.append("id", filters.id);
    if (filters?.page) params.append("page", filters.page.toString());

    const res = await apiRequest("GET", `/api/audit?${params}`);
    return res.json();
  },
};
