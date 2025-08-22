import { z } from "zod";

export const aadhaarSchema = z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits");
export const panSchema = z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format");
export const vehicleSchema = z.string().min(1, "Vehicle registration required");

export const createEmployeeSchema = z.object({
  aadhaar: aadhaarSchema,
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dealerId: z.string().min(1, "Dealer ID required"),
  dateOfJoining: z.string().min(1, "Date of joining required"),
});

export const createPrivateClientSchema = z.object({
  clientType: z.literal("PRIVATE"),
  pan: panSchema,
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  vehicles: z.array(vehicleSchema).min(1, "At least one vehicle required"),
  dealerId: z.string().min(1, "Dealer ID required"),
});

export const createGovernmentClientSchema = z.object({
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
  dealerId: z.string().min(1, "Dealer ID required"),
});

export const endEmploymentSchema = z.object({
  separationDate: z.string().min(1, "Separation date required"),
  separationType: z.enum(["RESIGNED", "PERFORMANCE", "CONDUCT", "REDUNDANCY", "OTHER"]),
  remarks: z.string().min(1, "Remarks are required"),
});

export const createDealerSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  outletName: z.string().min(1, "Outlet name is required"),
  location: z.string().min(1, "Location is required"),
});
