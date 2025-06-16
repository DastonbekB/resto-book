import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        price: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      billingPeriod,
      features,
      maxTables,
      maxReservationsPerMonth,
      hasAnalytics,
      hasSMSNotifications,
      hasAPIAccess,
      hasCustomBranding,
      hasPrioritySupport,
    } = body;

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        billingPeriod,
        features: JSON.stringify(features),
        maxTables,
        maxReservationsPerMonth,
        hasAnalytics: hasAnalytics || false,
        hasSMSNotifications: hasSMSNotifications || false,
        hasAPIAccess: hasAPIAccess || false,
        hasCustomBranding: hasCustomBranding || false,
        hasPrioritySupport: hasPrioritySupport || false,
      },
    });

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error creating subscription plan:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}
