import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const createReservationSchema = z.object({
  restaurantId: z.string(),
  tableId: z.string(),
  date: z.string(),
  time: z.string(),
  partySize: z.number().min(1).max(20),
  specialNotes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createReservationSchema.parse(body);

    const { restaurantId, tableId, date, time, partySize, specialNotes } =
      validatedData;
    const reservationDate = new Date(date);

    // Verify user exists in database (for debugging foreign key constraint)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "User account not found. Please log in again." },
        { status: 404 }
      );
    }

    // Check if restaurant exists and is active
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId, isActive: true },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found or inactive" },
        { status: 404 }
      );
    }

    // Check if table exists and belongs to restaurant
    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
        restaurantId: restaurantId,
        isActive: true,
      },
    });

    if (!table) {
      return NextResponse.json(
        { error: "Table not found or inactive" },
        { status: 404 }
      );
    }

    // Check if table capacity is sufficient
    if (partySize > table.capacity) {
      return NextResponse.json(
        {
          error: `Table capacity (${table.capacity}) insufficient for party size (${partySize})`,
        },
        { status: 400 }
      );
    }

    // Check if table is available at the requested time
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        restaurantId,
        tableId,
        date: reservationDate,
        time,
        status: {
          in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: "Table is not available at the requested time" },
        { status: 409 }
      );
    }

    // Create the reservation with explicit foreign key validation
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        restaurantId,
        tableId,
        date: reservationDate,
        time,
        partySize,
        specialNotes,
        status: "PENDING",
      },
      include: {
        restaurant: {
          select: {
            name: true,
            location: true,
          },
        },
        table: {
          select: {
            number: true,
            capacity: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Reservation created successfully",
      reservation: {
        id: reservation.id,
        restaurantName: reservation.restaurant.name,
        restaurantLocation: reservation.restaurant.location,
        tableNumber: reservation.table.number,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status,
        specialNotes: reservation.specialNotes,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    // Log the full error for debugging
    console.error("Error creating reservation:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code || "Unknown",
      meta: error.meta || "No meta",
    });

    // Check if it's a Prisma foreign key constraint error
    if (error.code === "P2003") {
      const meta = error.meta || {};
      return NextResponse.json(
        {
          error:
            "Invalid reference detected. Please ensure all required data exists.",
          details: `Foreign key constraint failed on field: ${
            meta.field_name || "unknown"
          }`,
          debug:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create reservation" },
      { status: 500 }
    );
  }
}

// GET method to fetch reservations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const userId = searchParams.get("userId");

    const whereClause: Prisma.ReservationWhereInput = {};

    // Super admin can see all reservations
    if (session.user.role === "SUPER_ADMIN") {
      if (restaurantId) whereClause.restaurantId = restaurantId;
      if (userId) whereClause.userId = userId;
    }
    // Restaurant admin can see their restaurant's reservations
    else if (session.user.role === "RESTAURANT_ADMIN") {
      const restaurant = await prisma.restaurant.findFirst({
        where: {
          ownerId: session.user.id,
          ...(restaurantId && { id: restaurantId }),
        },
      });

      if (!restaurant) {
        return NextResponse.json(
          { error: "Restaurant not found or access denied" },
          { status: 404 }
        );
      }

      whereClause.restaurantId = restaurant.id;
      if (userId) whereClause.userId = userId;
    }
    // Reception admin can see assigned restaurant's reservations
    else if (session.user.role === "RECEPTION_ADMIN") {
      const assignment = await prisma.receptionistAssignment.findFirst({
        where: { userId: session.user.id },
        include: { restaurant: true },
      });

      if (!assignment) {
        return NextResponse.json(
          { error: "No restaurant assignment found" },
          { status: 404 }
        );
      }

      whereClause.restaurantId = assignment.restaurantId;
      if (userId) whereClause.userId = userId;
    }
    // Customers can only see their own reservations
    else {
      whereClause.userId = session.user.id;
    }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        restaurant: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        table: {
          select: {
            id: true,
            number: true,
            capacity: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      reservations,
      count: reservations.length,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
