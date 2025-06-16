import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Get first restaurant and table for testing
    const restaurant = await prisma.restaurant.findFirst({
      where: { isActive: true },
      include: {
        tables: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    // Check existing reservations
    const reservationCount = await prisma.reservation.count();

    return NextResponse.json({
      debug: {
        sessionUserId: session.user.id,
        userExists: !!user,
        userDetails: user
          ? {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          : null,
        restaurantExists: !!restaurant,
        restaurantId: restaurant?.id,
        tableExists: restaurant?.tables?.length > 0,
        tableId: restaurant?.tables?.[0]?.id,
        existingReservationCount: reservationCount,
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error.message },
      { status: 500 }
    );
  }
}
