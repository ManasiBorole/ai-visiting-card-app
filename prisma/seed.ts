import "dotenv/config";

import bcrypt from "bcryptjs";

import { prisma } from "../database/client";

async function main() {
  console.log("Seeding database...");

  await prisma.activityLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.visitingCard.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const demoPasswordHash = await bcrypt.hash("Password123", 12);
  const adminPasswordHash = await bcrypt.hash("Password123", 12);

  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@visitingcard.ai",
      passwordHash: demoPasswordHash,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@visitingcard.ai",
      passwordHash: adminPasswordHash,
    },
  });

  const categories = await Promise.all([
    prisma.category.create({
      data: { name: "Business", color: "#2563eb", userId: demoUser.id },
    }),
    prisma.category.create({
      data: { name: "Personal", color: "#16a34a", userId: demoUser.id },
    }),
    prisma.category.create({
      data: { name: "Vendor", color: "#ea580c", userId: demoUser.id },
    }),
    prisma.category.create({
      data: { name: "Client", color: "#9333ea", userId: demoUser.id },
    }),
  ]);

  const [business, personal, vendor, client] = categories;

  const cards = await Promise.all([
    prisma.visitingCard.create({
      data: {
        name: "Rajesh Kumar",
        company: "TechNova Solutions Pvt. Ltd.",
        designation: "Chief Technology Officer",
        mobile: "+91 98765 43210",
        alternateMobile: "+91 91234 56789",
        email: "rajesh.kumar@technova.com",
        website: "https://technova.com",
        address: "42, Innovation Park, Sector 62",
        city: "Noida",
        state: "Uttar Pradesh",
        country: "India",
        pinCode: "201301",
        gstNumber: "09AABCT1234F1Z5",
        notes: "Met at SaaS conference 2025. Interested in AI integrations.",
        tags: ["enterprise", "saas", "priority"],
        frontImage: "/uploads/cards/rajesh-kumar-front.jpg",
        backImage: "/uploads/cards/rajesh-kumar-back.jpg",
        userId: demoUser.id,
        categoryId: business.id,
      },
    }),
    prisma.visitingCard.create({
      data: {
        name: "Priya Sharma",
        company: "Creative Pulse Agency",
        designation: "Creative Director",
        mobile: "+91 99887 76655",
        email: "priya@creativepulse.in",
        website: "https://creativepulse.in",
        address: "15, Art District, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pinCode: "400050",
        notes: "Handles branding for startup clients.",
        tags: ["design", "marketing"],
        frontImage: "/uploads/cards/priya-sharma-front.jpg",
        userId: demoUser.id,
        categoryId: client.id,
      },
    }),
    prisma.visitingCard.create({
      data: {
        name: "Amit Patel",
        company: "Patel Office Supplies",
        designation: "Proprietor",
        mobile: "+91 90123 45678",
        email: "amit@pateloffice.com",
        address: "78, Commercial Street",
        city: "Ahmedabad",
        state: "Gujarat",
        country: "India",
        pinCode: "380001",
        gstNumber: "24AABCP5678G1Z2",
        tags: ["vendor", "supplies"],
        userId: demoUser.id,
        categoryId: vendor.id,
      },
    }),
    prisma.visitingCard.create({
      data: {
        name: "Sarah Johnson",
        company: "Global Ventures LLC",
        designation: "Partnerships Manager",
        mobile: "+1 415 555 0199",
        email: "sarah.j@globalventures.com",
        website: "https://globalventures.com",
        city: "San Francisco",
        state: "California",
        country: "USA",
        pinCode: "94105",
        notes: "Potential international partner.",
        tags: ["international", "partnership"],
        userId: adminUser.id,
        categoryId: business.id,
      },
    }),
    prisma.visitingCard.create({
      data: {
        name: "Vikram Singh",
        designation: "Freelance Consultant",
        mobile: "+91 88776 65544",
        email: "vikram.singh@gmail.com",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        pinCode: "560001",
        tags: ["personal", "consultant"],
        userId: adminUser.id,
        categoryId: personal.id,
      },
    }),
  ]);

  const [rajeshCard, priyaCard, amitCard, sarahCard, vikramCard] = cards;

  await prisma.activityLog.createMany({
    data: [
      {
        action: "User account created",
        date: new Date("2025-06-01T10:00:00.000Z"),
        userId: demoUser.id,
      },
      {
        action: "Added visiting card: Rajesh Kumar",
        date: new Date("2025-06-15T09:30:00.000Z"),
        userId: demoUser.id,
        visitingCardId: rajeshCard.id,
      },
      {
        action: "Added visiting card: Priya Sharma",
        date: new Date("2025-06-18T14:15:00.000Z"),
        userId: demoUser.id,
        visitingCardId: priyaCard.id,
      },
      {
        action: "Updated GST details for Amit Patel",
        date: new Date("2025-06-22T11:45:00.000Z"),
        userId: demoUser.id,
        visitingCardId: amitCard.id,
      },
      {
        action: "Scanned front image for Rajesh Kumar",
        date: new Date("2025-07-01T08:20:00.000Z"),
        userId: demoUser.id,
        visitingCardId: rajeshCard.id,
      },
      {
        action: "User account created",
        date: new Date("2025-06-10T12:00:00.000Z"),
        userId: adminUser.id,
      },
      {
        action: "Added visiting card: Sarah Johnson",
        date: new Date("2025-07-02T16:00:00.000Z"),
        userId: adminUser.id,
        visitingCardId: sarahCard.id,
      },
      {
        action: "Added visiting card: Vikram Singh",
        date: new Date("2025-07-03T10:30:00.000Z"),
        userId: adminUser.id,
        visitingCardId: vikramCard.id,
      },
      {
        action: "Exported card list to CSV",
        date: new Date("2025-07-04T18:00:00.000Z"),
        userId: adminUser.id,
      },
    ],
  });

  console.log("Seed completed successfully.");
  console.log("  Users: 2");
  console.log(`  Categories: ${categories.length}`);
  console.log(`  Visiting cards: ${cards.length}`);
  console.log("  Activity logs: 9");
  console.log("");
  console.log("  Demo login: demo@visitingcard.ai / Password123");
  console.log("  Admin login: admin@visitingcard.ai / Password123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
