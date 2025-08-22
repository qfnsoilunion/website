import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "./db";
import { adminAuth, dealerProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "Union@2025";

// Initialize admin account if it doesn't exist
export async function initializeAdmin() {
  try {
    const [existingAdmin] = await db.select().from(adminAuth).where(eq(adminAuth.username, ADMIN_USERNAME));
    
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      const secret = speakeasy.generateSecret({
        name: `Union Registry Admin`,
        length: 32,
      });

      await db.insert(adminAuth).values({
        username: ADMIN_USERNAME,
        passwordHash,
        totpSecret: secret.base32,
        totpEnabled: false,
      });
      
      console.log("Admin account initialized successfully");
    }
  } catch (error) {
    console.error("Failed to initialize admin account:", error);
  }
}

// Verify admin password
export async function verifyAdminPassword(password: string): Promise<{
  success: boolean;
  totpEnabled?: boolean;
  qrCode?: string;
}> {
  try {
    const [admin] = await db.select().from(adminAuth).where(eq(adminAuth.username, ADMIN_USERNAME));
    
    if (!admin) {
      return { success: false };
    }

    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) {
      return { success: false };
    }

    // If 2FA is not enabled, generate QR code for first-time setup
    if (!admin.totpEnabled && admin.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: admin.totpSecret,
        label: `Union Registry Admin`,
        issuer: "Union Registry",
        encoding: "base32",
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

// Verify TOTP code
export async function verifyAdminTotp(code: string, enableTotp = false): Promise<boolean> {
  try {
    const [admin] = await db.select().from(adminAuth).where(eq(adminAuth.username, ADMIN_USERNAME));
    
    if (!admin || !admin.totpSecret) {
      return false;
    }

    const verified = speakeasy.totp.verify({
      secret: admin.totpSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (verified && enableTotp && !admin.totpEnabled) {
      // Enable 2FA after successful first verification
      await db
        .update(adminAuth)
        .set({ totpEnabled: true, lastLogin: new Date() })
        .where(eq(adminAuth.username, ADMIN_USERNAME));
    } else if (verified) {
      // Update last login
      await db
        .update(adminAuth)
        .set({ lastLogin: new Date() })
        .where(eq(adminAuth.username, ADMIN_USERNAME));
    }

    return verified;
  } catch (error) {
    console.error("TOTP verification error:", error);
    return false;
  }
}

// Create dealer profile with temporary password flag
export async function createDealerProfile(
  dealerId: string,
  username: string,
  password: string,
  email: string,
  mobile: string
): Promise<{ success: boolean; qrCode?: string; error?: string }> {
  try {
    // Check if username already exists
    const [existingProfile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.username, username));
    
    if (existingProfile) {
      return { success: false, error: "Username already exists" };
    }

    // Check if dealer already has a profile
    const [existingDealerProfile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.dealerId, dealerId));
    
    if (existingDealerProfile) {
      return { success: false, error: "Dealer already has a profile" };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({
      name: `Union Registry - ${username}`,
      length: 32,
    });

    await db.insert(dealerProfiles).values({
      dealerId,
      username,
      passwordHash,
      email,
      mobile,
      totpSecret: secret.base32,
      totpEnabled: false,
      temporaryPassword: true,
    });

    // Generate QR code for 2FA setup
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: username,
      issuer: "Union Registry",
      encoding: "base32",
    });

    const qrCode = await QRCode.toDataURL(otpauthUrl);
    
    return { success: true, qrCode };
  } catch (error) {
    console.error("Failed to create dealer profile:", error);
    return { success: false, error: "Failed to create profile" };
  }
}

// Verify dealer login
export async function verifyDealerLogin(
  username: string,
  password: string
): Promise<{ 
  success: boolean; 
  dealerId?: string;
  totpEnabled?: boolean;
  qrCode?: string;
  temporaryPassword?: boolean;
}> {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.username, username));
    
    if (!profile) {
      return { success: false };
    }

    const isValid = await bcrypt.compare(password, profile.passwordHash);
    
    if (!isValid) {
      return { success: false };
    }

    // If 2FA is not enabled, return QR code for setup
    if (!profile.totpEnabled && profile.totpSecret) {
      const otpauthUrl = speakeasy.otpauthURL({
        secret: profile.totpSecret,
        label: username,
        issuer: "Union Registry",
        encoding: "base32",
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

// Verify dealer TOTP
export async function verifyDealerTotp(
  username: string,
  code: string,
  enableTotp = false
): Promise<{ success: boolean; dealerId?: string }> {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.username, username));
    
    if (!profile || !profile.totpSecret) {
      return { success: false };
    }

    const verified = speakeasy.totp.verify({
      secret: profile.totpSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (verified && enableTotp && !profile.totpEnabled) {
      // Enable 2FA after successful first verification
      await db
        .update(dealerProfiles)
        .set({ totpEnabled: true, lastLogin: new Date() })
        .where(eq(dealerProfiles.username, username));
    } else if (verified) {
      // Update last login
      await db
        .update(dealerProfiles)
        .set({ lastLogin: new Date() })
        .where(eq(dealerProfiles.username, username));
    }

    return { success: verified, dealerId: verified ? profile.dealerId : undefined };
  } catch (error) {
    console.error("Dealer TOTP verification error:", error);
    return { success: false };
  }
}

// Change dealer password (for first-time login or admin reset)
export async function changeDealerPassword(
  username: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.username, username));
    
    if (!profile) {
      return { success: false, error: "Dealer profile not found" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(dealerProfiles)
      .set({ 
        passwordHash,
        temporaryPassword: false,
        updatedAt: new Date()
      })
      .where(eq(dealerProfiles.username, username));

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Admin reset dealer password (generates new temporary password)
export async function resetDealerPassword(
  dealerId: string
): Promise<{ success: boolean; newPassword?: string; error?: string }> {
  try {
    const [profile] = await db.select().from(dealerProfiles).where(eq(dealerProfiles.dealerId, dealerId));
    
    if (!profile) {
      return { success: false, error: "Dealer profile not found" };
    }

    // Generate new temporary password
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let newPassword = "";
    for (let i = 0; i < 10; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db
      .update(dealerProfiles)
      .set({ 
        passwordHash,
        temporaryPassword: true,
        updatedAt: new Date()
      })
      .where(eq(dealerProfiles.dealerId, dealerId));

    return { success: true, newPassword };
  } catch (error) {
    console.error("Password reset error:", error);
    return { success: false, error: "Failed to reset password" };
  }
}