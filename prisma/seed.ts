import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@rentnest.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedAdminPassword,
      name: "RentNest Admin",
      role: Role.ADMIN,
    },
  });

  console.log(`Admin created: ${admin.email}`);

  const categories = [
    { name: "Apartment", description: "Multi-unit residential buildings" },
    { name: "House", description: "Standalone residential homes" },
    { name: "Studio", description: "Compact single-room apartments" },
    { name: "Villa", description: "Luxury standalone properties" },
    { name: "Condo", description: "Individually owned units in a complex" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log(`Categories seeded: ${categories.length}`);

  const landlordPassword = await bcrypt.hash("landlord123", 12);
  const tenantPassword = await bcrypt.hash("tenant123", 12);

  const landlord = await prisma.user.upsert({
    where: { email: "landlord@rentnest.com" },
    update: {},
    create: {
      email: "landlord@rentnest.com",
      password: landlordPassword,
      name: "John Landlord",
      phone: "+8801712345678",
      role: Role.LANDLORD,
    },
  });

  const tenant = await prisma.user.upsert({
    where: { email: "tenant@rentnest.com" },
    update: {},
    create: {
      email: "tenant@rentnest.com",
      password: tenantPassword,
      name: "Jane Tenant",
      phone: "+8801812345678",
      role: Role.TENANT,
    },
  });

  console.log(`Demo landlord: ${landlord.email}`);
  console.log(`Demo tenant: ${tenant.email}`);

  const apartmentCategory = await prisma.category.findUnique({
    where: { name: "Apartment" },
  });

  if (apartmentCategory) {
    const existingProperty = await prisma.property.findFirst({
      where: { landlordId: landlord.id },
    });

    if (!existingProperty) {
      await prisma.property.create({
        data: {
          title: "Modern 2BR Apartment in Gulshan",
          description:
            "Beautiful modern apartment with city views, fully furnished, 24/7 security, gym access, and parking included.",
          location: "Gulshan",
          address: "Road 45, Gulshan-2, Dhaka",
          price: 45000,
          bedrooms: 2,
          bathrooms: 2,
          area: 1200,
          amenities: ["WiFi", "Parking", "Gym", "Security", "Elevator"],
          images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
          ],
          landlordId: landlord.id,
          categoryId: apartmentCategory.id,
        },
      });
      console.log("Sample property created");
    }
  }

  console.log("\nSeed completed!");
  console.log("--- Credentials ---");
  console.log(`Admin:   ${adminEmail} / ${adminPassword}`);
  console.log("Landlord: landlord@rentnest.com / landlord123");
  console.log("Tenant:   tenant@rentnest.com / tenant123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
