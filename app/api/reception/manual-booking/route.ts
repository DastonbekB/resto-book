import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const manualBookingSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  restaurantId: z.string(),
  tableId: z.string().optional(),
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

    if (session.user.role !== "RECEPTION_ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Reception admin role required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = manualBookingSchema.parse(body);

    const {
      customerName,
      customerEmail,
      customerPhone,
      restaurantId,
      tableId,
      date,
      time,
      partySize,
      specialNotes,
    } = validatedData;

    // Verify reception admin has access to this restaurant
    const assignment = await prisma.receptionistAssignment.findFirst({
      where: {
        userId: session.user.id,
        restaurantId: restaurantId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        {
          error:
            "Access denied. You don't have permission for this restaurant.",
        },
        { status: 403 }
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

    // If tableId is provided, check if table exists and belongs to restaurant
    let table = null;
    if (tableId) {
      table = await prisma.table.findUnique({
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
      const reservationDate = new Date(date);
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
    }

    // Check if customer exists, if not create one
    let customer = await prisma.user.findUnique({
      where: { email: customerEmail },
    });

    if (!customer) {
      // Create a new customer account
      customer = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail,
          role: "CUSTOMER",
        },
      });
    }

    // Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: customer.id,
        restaurantId,
        tableId: tableId || null,
        date: new Date(date),
        time,
        partySize,
        specialNotes: specialNotes || null,
        status: "CONFIRMED", // Manual bookings are automatically confirmed
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
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Manual booking created successfully",
      reservation: {
        id: reservation.id,
        customer: {
          name: reservation.user.name,
          email: reservation.user.email,
        },
        restaurant: {
          name: reservation.restaurant.name,
          location: reservation.restaurant.location,
        },
        table: reservation.table
          ? {
              number: reservation.table.number,
              capacity: reservation.table.capacity,
            }
          : null,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status,
        specialNotes: reservation.specialNotes,
        phone: customerPhone,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating manual booking:", error);
    return NextResponse.json(
      { error: "Failed to create manual booking" },
      { status: 500 }
    );
  }
}
