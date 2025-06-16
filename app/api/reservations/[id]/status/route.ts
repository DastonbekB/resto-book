import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN",
    "COMPLETED",
    "CANCELLED",
    "NO_SHOW",
  ]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Get the reservation to verify ownership and current status
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            name: true,
            ownerId: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isCustomer = session.user.id === reservation.userId;
    const isRestaurantOwner =
      session.user.id === reservation.restaurant.ownerId;
    const isReceptionist = session.user.role === "RECEPTION_ADMIN";
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isCustomer && !isRestaurantOwner && !isReceptionist && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Not authorized to update this reservation" },
        { status: 403 }
      );
    }

    // Validate status transitions based on user role
    if (isCustomer) {
      // Customers can only cancel their own reservations
      if (validatedData.status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Customers can only cancel reservations" },
          { status: 403 }
        );
      }

      // Check if cancellation is allowed (e.g., not too close to reservation time)
      const reservationDateTime = new Date(
        `${reservation.date}T${reservation.time}`
      );
      const now = new Date();
      const hoursUntilReservation =
        (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilReservation < 2) {
        return NextResponse.json(
          {
            error:
              "Cannot cancel reservation less than 2 hours before the scheduled time",
          },
          { status: 400 }
        );
      }

      // Check if reservation is in a cancellable state
      if (!["PENDING", "CONFIRMED"].includes(reservation.status)) {
        return NextResponse.json(
          { error: "This reservation cannot be cancelled" },
          { status: 400 }
        );
      }
    }

    // Update the reservation status
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: {
        status: validatedData.status,
        updatedAt: new Date(),
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
      message: "Reservation status updated successfully",
      reservation: updatedReservation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status value", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating reservation status:", error);
    return NextResponse.json(
      { error: "Failed to update reservation status" },
      { status: 500 }
    );
  }
}
