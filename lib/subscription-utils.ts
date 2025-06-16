import { prisma } from "@/lib/prisma";

export interface SubscriptionLimits {
  maxTables: number | null;
  maxReservationsPerMonth: number | null;
  hasAnalytics: boolean;
  hasSMSNotifications: boolean;
  hasAPIAccess: boolean;
  hasCustomBranding: boolean;
  hasPrioritySupport: boolean;
}

export async function getRestaurantSubscription(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      subscription: {
        include: {
          plan: true,
        },
      },
    },
  });

  return restaurant?.subscription || null;
}

export async function checkSubscriptionLimits(
  restaurantId: string
): Promise<SubscriptionLimits> {
  const subscription = await getRestaurantSubscription(restaurantId);

  if (!subscription) {
    // Default to free plan limits if no subscription
    return {
      maxTables: 10,
      maxReservationsPerMonth: 50,
      hasAnalytics: false,
      hasSMSNotifications: false,
      hasAPIAccess: false,
      hasCustomBranding: false,
      hasPrioritySupport: false,
    };
  }

  return {
    maxTables: subscription.plan.maxTables,
    maxReservationsPerMonth: subscription.plan.maxReservationsPerMonth,
    hasAnalytics: subscription.plan.hasAnalytics,
    hasSMSNotifications: subscription.plan.hasSMSNotifications,
    hasAPIAccess: subscription.plan.hasAPIAccess,
    hasCustomBranding: subscription.plan.hasCustomBranding,
    hasPrioritySupport: subscription.plan.hasPrioritySupport,
  };
}

export async function canCreateTable(restaurantId: string): Promise<boolean> {
  const limits = await checkSubscriptionLimits(restaurantId);

  if (limits.maxTables === null) {
    return true; // Unlimited tables
  }

  const currentTableCount = await prisma.table.count({
    where: {
      restaurantId,
      isActive: true,
    },
  });

  return currentTableCount < limits.maxTables;
}

export async function canCreateReservation(
  restaurantId: string
): Promise<boolean> {
  const limits = await checkSubscriptionLimits(restaurantId);

  if (limits.maxReservationsPerMonth === null) {
    return true; // Unlimited reservations
  }

  // Get current month's reservation count
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const currentReservationCount = await prisma.reservation.count({
    where: {
      restaurantId,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
  });

  return currentReservationCount < limits.maxReservationsPerMonth;
}

export async function updateSubscriptionUsage(
  subscriptionId: string,
  type: "reservation" | "reset"
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) return;

  if (type === "reservation") {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        reservationsUsed: {
          increment: 1,
        },
      },
    });
  } else if (type === "reset") {
    // Reset monthly counters (this could be called by a cron job)
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        reservationsUsed: 0,
        resetDate: new Date(),
      },
    });
  }
}

export async function hasFeatureAccess(
  restaurantId: string,
  feature: keyof Omit<
    SubscriptionLimits,
    "maxTables" | "maxReservationsPerMonth"
  >
): Promise<boolean> {
  const limits = await checkSubscriptionLimits(restaurantId);
  return limits[feature];
}

export function isSubscriptionActive(subscription: {
  status: string;
  trialEndsAt: string;
  isTrialActive: boolean;
}): boolean {
  if (!subscription) return false;

  const now = new Date();

  // Check if subscription is cancelled
  if (subscription.status === "CANCELLED") return false;

  // Check if subscription is expired
  if (subscription.status === "EXPIRED") return false;

  // Check if trial has ended and subscription is not paid
  if (subscription.isTrialActive && subscription.trialEndsAt) {
    const trialEnd = new Date(subscription.trialEndsAt);
    if (now > trialEnd && subscription.status === "TRIAL") {
      return false;
    }
  }

  return ["ACTIVE", "TRIAL"].includes(subscription.status);
}

export function getSubscriptionStatusMessage(subscription: {
  status: string;
  trialEndsAt: string;
}): string {
  if (!subscription) {
    return "No active subscription. Please choose a plan to continue.";
  }

  const now = new Date();

  switch (subscription.status) {
    case "TRIAL":
      if (subscription.trialEndsAt) {
        const trialEnd = new Date(subscription.trialEndsAt);
        const daysLeft = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysLeft > 0) {
          return `Trial period - ${daysLeft} days remaining`;
        } else {
          return "Trial period has ended. Please upgrade to continue.";
        }
      }
      return "Trial period active";

    case "ACTIVE":
      return "Subscription active";

    case "CANCELLED":
      return "Subscription cancelled. Reactivate to continue using premium features.";

    case "EXPIRED":
      return "Subscription expired. Please renew to continue.";

    case "PAST_DUE":
      return "Payment overdue. Please update your payment method.";

    default:
      return "Unknown subscription status";
  }
}
