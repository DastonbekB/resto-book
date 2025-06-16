import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo users
  const hashedPassword = await bcrypt.hash("password123", 12);

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: "super@demo.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "super@demo.com",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  // Restaurant Admin
  const restaurantAdmin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      name: "Restaurant Owner",
      email: "admin@demo.com",
      password: hashedPassword,
      role: "RESTAURANT_ADMIN",
    },
  });

  // Customer
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "customer@demo.com",
      password: hashedPassword,
      role: "CUSTOMER",
    },
  });

  // Reception Admin
  const receptionAdmin = await prisma.user.upsert({
    where: { email: "reception@demo.com" },
    update: {},
    create: {
      name: "Reception Staff",
      email: "reception@demo.com",
      password: hashedPassword,
      role: "RECEPTION_ADMIN",
    },
  });

  // Create sample restaurants
  const restaurant1 = await prisma.restaurant.create({
    data: {
      name: "Bella Vista Italian",
      description:
        "Authentic Italian cuisine with a modern twist. Our chefs prepare traditional dishes using fresh, imported ingredients from Italy. Perfect for romantic dinners and family gatherings.",
      location: "Downtown Manhattan, NY",
      phone: "+1 (555) 123-4567",
      email: "info@bellavista.com",
      website: "https://bellavista.com",
      images: "restaurant1.jpg,italian-food.jpg,interior1.jpg",
      openingHours: "Mon-Thu: 5PM-10PM, Fri-Sat: 5PM-11PM, Sun: 4PM-9PM",
      priceRange: "$$$",
      cuisine: "Italian",
      capacity: 120,
      isFeatured: true,
      ownerId: restaurantAdmin.id,
    },
  });

  const restaurant2 = await prisma.restaurant.create({
    data: {
      name: "Sakura Sushi House",
      description:
        "Experience the finest Japanese cuisine prepared by master sushi chefs. Fresh fish delivered daily and traditional techniques passed down through generations.",
      location: "Midtown East, NY",
      phone: "+1 (555) 234-5678",
      email: "hello@sakurasushi.com",
      website: "https://sakurasushi.com",
      images: "sushi-bar.jpg,japanese-interior.jpg,sashimi.jpg",
      openingHours: "Daily: 12PM-10PM",
      priceRange: "$$$$",
      cuisine: "Japanese",
      capacity: 80,
      isFeatured: true,
      ownerId: restaurantAdmin.id,
    },
  });

  const restaurant3 = await prisma.restaurant.create({
    data: {
      name: "The Garden Bistro",
      description:
        "Farm-to-table American cuisine featuring locally sourced ingredients. Enjoy our seasonal menu in a cozy, garden-inspired atmosphere.",
      location: "Brooklyn Heights, NY",
      phone: "+1 (555) 345-6789",
      email: "reservations@gardenbistro.com",
      website: "https://gardenbistro.com",
      images: "garden-bistro.jpg,farm-food.jpg,outdoor-seating.jpg",
      openingHours: "Mon-Sun: 8AM-10PM",
      priceRange: "$$",
      cuisine: "American",
      capacity: 60,
      isFeatured: false,
      ownerId: restaurantAdmin.id,
    },
  });

  const restaurant4 = await prisma.restaurant.create({
    data: {
      name: "Spice Route Indian",
      description:
        "Authentic Indian flavors from across the subcontinent. Our tandoor oven and traditional spice blends create unforgettable dining experiences.",
      location: "Queens, NY",
      phone: "+1 (555) 456-7890",
      email: "info@spiceroute.com",
      images: "indian-restaurant.jpg,curry-dishes.jpg,tandoor.jpg",
      openingHours: "Daily: 11AM-11PM",
      priceRange: "$$",
      cuisine: "Indian",
      capacity: 100,
      isFeatured: false,
      ownerId: restaurantAdmin.id,
    },
  });

  const restaurant5 = await prisma.restaurant.create({
    data: {
      name: "Le Petit Paris",
      description:
        "Elegant French dining in the heart of the city. Classic French techniques meet contemporary presentation in our intimate setting.",
      location: "Upper East Side, NY",
      phone: "+1 (555) 567-8901",
      email: "contact@lepetitparis.com",
      website: "https://lepetitparis.com",
      images: "french-restaurant.jpg,wine-cellar.jpg,french-cuisine.jpg",
      openingHours: "Tue-Sat: 6PM-11PM, Sun: 5PM-10PM",
      priceRange: "$$$$",
      cuisine: "French",
      capacity: 50,
      isFeatured: true,
      ownerId: restaurantAdmin.id,
    },
  });

  const restaurant6 = await prisma.restaurant.create({
    data: {
      name: "Taco Loco",
      description:
        "Vibrant Mexican street food and modern Mexican cuisine. Fresh guacamole made tableside and creative cocktails in a fun atmosphere.",
      location: "Lower East Side, NY",
      phone: "+1 (555) 678-9012",
      email: "hola@tacoloco.com",
      images: "mexican-restaurant.jpg,tacos.jpg,bar-area.jpg",
      openingHours: "Daily: 11AM-12AM",
      priceRange: "$",
      cuisine: "Mexican",
      capacity: 90,
      isFeatured: false,
      ownerId: restaurantAdmin.id,
    },
  });

  // Create tables for each restaurant
  const tables1 = await Promise.all([
    prisma.table.create({
      data: { number: "1", capacity: 2, restaurantId: restaurant1.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 4, restaurantId: restaurant1.id },
    }),
    prisma.table.create({
      data: { number: "3", capacity: 6, restaurantId: restaurant1.id },
    }),
    prisma.table.create({
      data: { number: "4", capacity: 8, restaurantId: restaurant1.id },
    }),
  ]);

  const tables2 = await Promise.all([
    prisma.table.create({
      data: { number: "1", capacity: 2, restaurantId: restaurant2.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 4, restaurantId: restaurant2.id },
    }),
    prisma.table.create({
      data: { number: "3", capacity: 6, restaurantId: restaurant2.id },
    }),
  ]);

  // Add tables for other restaurants
  await Promise.all([
    prisma.table.create({
      data: { number: "1", capacity: 4, restaurantId: restaurant3.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 6, restaurantId: restaurant3.id },
    }),
    prisma.table.create({
      data: { number: "1", capacity: 4, restaurantId: restaurant4.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 6, restaurantId: restaurant4.id },
    }),
    prisma.table.create({
      data: { number: "3", capacity: 8, restaurantId: restaurant4.id },
    }),
    prisma.table.create({
      data: { number: "1", capacity: 2, restaurantId: restaurant5.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 4, restaurantId: restaurant5.id },
    }),
    prisma.table.create({
      data: { number: "1", capacity: 4, restaurantId: restaurant6.id },
    }),
    prisma.table.create({
      data: { number: "2", capacity: 6, restaurantId: restaurant6.id },
    }),
    prisma.table.create({
      data: { number: "3", capacity: 8, restaurantId: restaurant6.id },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log("\n📧 Demo accounts created:");
  console.log("Super Admin: super@demo.com / password123");
  console.log("Restaurant Admin: admin@demo.com / password123");
  console.log("Customer: customer@demo.com / password123");
  console.log("Reception: reception@demo.com / password123");
  console.log("\n🍽️ Sample restaurants created:");
  console.log("- Bella Vista Italian (Featured)");
  console.log("- Sakura Sushi House (Featured)");
  console.log("- The Garden Bistro");
  console.log("- Spice Route Indian");
  console.log("- Le Petit Paris (Featured)");
  console.log("- Taco Loco");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
