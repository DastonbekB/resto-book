import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's restaurant subscription
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { success: false, error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: restaurant.subscription,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingPeriod = "monthly", paymentDetails } = body;

    // Get the restaurant owned by the current user
    let restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        subscription: true,
      },
    });

    // If no restaurant exists, create one automatically for restaurant owners
    if (!restaurant) {
      // Check if user role is restaurant admin/owner
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (user?.role !== "RESTAURANT_ADMIN") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Only restaurant owners can subscribe to plans. Please create a restaurant first.",
          },
          { status: 403 }
        );
      }

      // Create a default restaurant for the user
      restaurant = await prisma.restaurant.create({
        data: {
          name: `${session.user.name}'s Restaurant`,
          description: "New restaurant setup - please update your details",
          location: "To be updated",
          images: "[]",
          ownerId: session.user.id,
        },
        include: {
          subscription: true,
        },
      });
    }

    // Check if restaurant already has an active subscription
    if (
      restaurant.subscription &&
      restaurant.subscription.status === "ACTIVE"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Restaurant already has an active subscription. Please manage your existing subscription.",
        },
        { status: 400 }
      );
    }

    // Get the plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Calculate dates
    const startDate = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial

    const nextBillingDate = new Date();
    if (billingPeriod === "yearly") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    } else {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        planId,
        status: plan.price === 0 ? "ACTIVE" : "ACTIVE", // Set to ACTIVE for paid plans too in demo
        startDate,
        trialEndsAt: plan.price === 0 ? null : trialEndsAt,
        isTrialActive: plan.price > 0 && !paymentDetails, // Only trial if no payment provided
        nextBillingDate: plan.price === 0 ? null : nextBillingDate,
        resetDate: new Date(), // Reset monthly counters
      },
      include: {
        plan: true,
      },
    });

    // Update restaurant to link to subscription
    await prisma.restaurant.update({
      where: { id: restaurant.id },
      data: {
        subscriptionId: subscription.id,
      },
    });

    // Simulate payment processing for paid plans
    if (plan.price > 0 && paymentDetails) {
      // In a real app, you would process the payment here
      console.log("Simulated payment processing:", {
        amount: plan.price,
        billingPeriod,
        cardLast4: paymentDetails.cardLast4,
        paymentMethod: paymentDetails.paymentMethod,
      });

      // Create a payment record for demo purposes
      await prisma.payment.create({
        data: {
          restaurantId: restaurant.id,
          amount:
            billingPeriod === "yearly" ? plan.price * 12 * 0.8 : plan.price,
          status: "COMPLETED",
          type: "SUBSCRIPTION",
          description: `Subscription payment for ${plan.name} plan (${billingPeriod})`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      subscription,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      message:
        plan.price === 0
          ? "Successfully activated free plan"
          : paymentDetails
          ? "Payment successful! Subscription activated."
          : "Successfully started free trial",
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, planId } = body;

    // Get the restaurant and current subscription
    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    });

    if (!restaurant || !restaurant.subscription) {
      return NextResponse.json(
        { success: false, error: "No active subscription found" },
        { status: 404 }
      );
    }

    let updatedSubscription;

    switch (action) {
      case "cancel":
        updatedSubscription = await prisma.subscription.update({
          where: { id: restaurant.subscription.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
          include: {
            plan: true,
          },
        });
        break;

      case "upgrade":
      case "downgrade":
        if (!planId) {
          return NextResponse.json(
            { success: false, error: "Plan ID required for plan changes" },
            { status: 400 }
          );
        }

        const newPlan = await prisma.subscriptionPlan.findUnique({
          where: { id: planId },
        });

        if (!newPlan) {
          return NextResponse.json(
            { success: false, error: "New plan not found" },
            { status: 404 }
          );
        }

        updatedSubscription = await prisma.subscription.update({
          where: { id: restaurant.subscription.id },
          data: {
            planId: newPlan.id,
            status: "ACTIVE",
            // Reset trial if upgrading to paid plan
            isTrialActive: false,
            trialEndsAt: null,
          },
          include: {
            plan: true,
          },
        });
        break;

      case "reactivate":
        updatedSubscription = await prisma.subscription.update({
          where: { id: restaurant.subscription.id },
          data: {
            status: "ACTIVE",
            cancelledAt: null,
          },
          include: {
            plan: true,
          },
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: `Subscription ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}
