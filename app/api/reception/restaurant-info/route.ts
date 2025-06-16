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

    if (session.user.role !== "RECEPTION_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Reception admin role required." },
        { status: 403 }
      );
    }

    // Find the restaurant assigned to this reception admin
    const assignment = await prisma.receptionistAssignment.findFirst({
      where: { userId: session.user.id },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            location: true,
            region: true,
            district: true,
            address: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "No restaurant assignment found for this reception admin" },
        { status: 404 }
      );
    }

    // Get all active tables for this restaurant
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: assignment.restaurantId,
        isActive: true,
      },
      select: {
        id: true,
        number: true,
        capacity: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    return NextResponse.json({
      restaurant: assignment.restaurant,
      tables,
    });
  } catch (error) {
    console.error("Error fetching restaurant info:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant information" },
      { status: 500 }
    );
  }
}
