import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  console.log("Seeding subscription plans...");

  // Free Plan
  const freePlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Free" },
    update: {},
    create: {
      name: "Free",
      description: "Perfect for small restaurants getting started",
      price: 0,
      billingPeriod: "monthly",
      features: JSON.stringify([
        "Up to 50 reservations/month",
        "Up to 10 tables",
        "Basic table management",
        "Email notifications",
        "Basic customer management",
        "Standard support",
      ]),
      maxTables: 10,
      maxReservationsPerMonth: 50,
      hasAnalytics: false,
      hasSMSNotifications: false,
      hasAPIAccess: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
    },
  });

  // Professional Plan
  const professionalPlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Professional" },
    update: {},
    create: {
      name: "Professional",
      description: "Ideal for growing restaurants with advanced needs",
      price: 29,
      billingPeriod: "monthly",
      features: JSON.stringify([
        "Unlimited reservations",
        "Unlimited tables",
        "Advanced table management",
        "Email & SMS notifications",
        "Advanced customer management",
        "Detailed analytics & reporting",
        "Priority support",
        "Custom reservation forms",
      ]),
      maxTables: null,
      maxReservationsPerMonth: null,
      hasAnalytics: true,
      hasSMSNotifications: true,
      hasAPIAccess: false,
      hasCustomBranding: false,
      hasPrioritySupport: true,
    },
  });

  // Enterprise Plan
  const enterprisePlan = await prisma.subscriptionPlan.upsert({
    where: { name: "Enterprise" },
    update: {},
    create: {
      name: "Enterprise",
      description:
        "Complete solution for restaurant chains and large establishments",
      price: 99,
      billingPeriod: "monthly",
      features: JSON.stringify([
        "Everything in Professional",
        "Multi-location support",
        "API access & integrations",
        "Custom branding",
        "Advanced integrations",
        "Dedicated account manager",
        "Custom reporting",
        "White-label options",
        "24/7 priority support",
      ]),
      maxTables: null,
      maxReservationsPerMonth: null,
      hasAnalytics: true,
      hasSMSNotifications: true,
      hasAPIAccess: true,
      hasCustomBranding: true,
      hasPrioritySupport: true,
    },
  });

  console.log("Subscription plans seeded successfully");
  console.log({ freePlan, professionalPlan, enterprisePlan });
}

async function main() {
  try {
    await seedSubscriptionPlans();
  } catch (error) {
    console.error("Error seeding subscription plans:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { seedSubscriptionPlans };
