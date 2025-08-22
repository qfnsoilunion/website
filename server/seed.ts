import { storage } from "./storage";

async function seed() {
  console.log("Seeding database...");

  try {
    // Create dealers
    const hilalDealer = await storage.createDealer({
      legalName: "Hilal Enterprises Pvt Ltd",
      outletName: "Hilal Petroleum",
      location: "Srinagar",
      status: "ACTIVE",
    });

    const bharatDealer = await storage.createDealer({
      legalName: "Bharat Petroleum Dealers",
      outletName: "Bharat Fuel Services",
      location: "Anantnag",
      status: "ACTIVE",
    });

    // Create persons and employments
    const person1 = await storage.createPerson({
      aadhaar: "123456789012",
      name: "Mohammad Ali Khan",
      mobile: "+919876543210",
      email: "ali.khan@example.com",
      address: "Rajbagh, Srinagar",
      dateOfBirth: new Date("1985-03-15"),
    });

    const person2 = await storage.createPerson({
      aadhaar: "234567890123",
      name: "Rahul Sharma",
      mobile: "+919876543211",
      email: "rahul.sharma@example.com",
      address: "Lal Chowk, Srinagar",
      dateOfBirth: new Date("1990-07-22"),
    });

    const person3 = await storage.createPerson({
      aadhaar: "345678901234",
      name: "Tariq Ahmad",
      mobile: "+919876543212",
      email: "tariq.ahmad@example.com",
      address: "Anantnag",
      dateOfBirth: new Date("1988-11-10"),
    });

    // Create employment records
    await storage.createEmploymentRecord({
      personId: person1.id,
      dealerId: hilalDealer.id,
      dateOfJoining: new Date("2023-01-15"),
      currentStatus: "ACTIVE",
    });

    await storage.createEmploymentRecord({
      personId: person2.id,
      dealerId: hilalDealer.id,
      dateOfJoining: new Date("2023-06-01"),
      currentStatus: "ACTIVE",
    });

    await storage.createEmploymentRecord({
      personId: person3.id,
      dealerId: bharatDealer.id,
      dateOfJoining: new Date("2023-03-20"),
      currentStatus: "ACTIVE",
    });

    // Create private client
    const privateClient = await storage.createClient({
      clientType: "PRIVATE",
      pan: "ABCTY1234D",
      name: "ABC Trading Corp",
      contactPerson: "Rajesh Kumar",
      mobile: "+919876543213",
      email: "contact@abctrading.com",
      address: "Industrial Area, Srinagar",
      gstin: "22ABCTY1234D1Z5",
    });

    // Create government client
    const govClient = await storage.createClient({
      clientType: "GOVERNMENT",
      govClientId: "PWD04202301",
      name: "PWD Kashmir - Unit 04",
      contactPerson: "Engineer Mohd Saleem",
      mobile: "+911942567890",
      email: "pwd.unit04@jk.gov.in",
      address: "Civil Secretariat, Srinagar",
    });

    // Create client-dealer links
    await storage.createClientDealerLink(
      privateClient.id,
      hilalDealer.id,
      new Date("2023-12-10")
    );

    await storage.createClientDealerLink(
      govClient.id,
      bharatDealer.id,
      new Date("2023-11-25")
    );

    // Create vehicles
    await storage.createVehicle({
      clientId: privateClient.id,
      registrationNumber: "JK01AB1234",
      fuelType: "Diesel",
    });

    await storage.createVehicle({
      clientId: privateClient.id,
      registrationNumber: "JK01CD5678",
      fuelType: "Petrol",
    });

    await storage.createVehicle({
      clientId: privateClient.id,
      registrationNumber: "JK01EF9012",
      fuelType: "Diesel",
    });

    // Create government client vehicles
    for (let i = 1; i <= 12; i++) {
      await storage.createVehicle({
        clientId: govClient.id,
        registrationNumber: `JK02GH${1000 + i}`,
        fuelType: "Diesel",
      });
    }

    // Create a pending transfer request
    await storage.createTransferRequest({
      clientId: privateClient.id,
      fromDealerId: hilalDealer.id,
      toDealerId: bharatDealer.id,
      reason: "Closer proximity to business operations",
    });

    // Create some audit logs
    await storage.createAuditLog({
      actor: "ADMIN",
      action: "CREATE",
      entity: "DEALER",
      entityId: hilalDealer.id,
      metadata: { legalName: "Hilal Enterprises Pvt Ltd" },
    });

    await storage.createAuditLog({
      actor: "DEALER:Hilal Petroleum",
      action: "CREATE",
      entity: "EMPLOYMENT",
      entityId: person1.id,
      metadata: { name: "Mohammad Ali Khan" },
    });

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch(console.error);
}

export { seed };
