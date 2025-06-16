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
            capacity: true,
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

    // Get date ranges
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get comprehensive statistics
    const [
      todayReservations,
      pendingReservations,
      confirmedReservations,
      cancelledReservations,
      checkedInReservations,
      weeklyReservations,
      monthlyReservations,
      totalTables,
      activeTables,
      recentReservations,
      todayUpcomingReservations,
    ] = await Promise.all([
      // Today's reservations
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Pending reservations (all time)
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          status: "PENDING",
        },
      }),
      // Confirmed reservations (all time)
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          status: "CONFIRMED",
        },
      }),
      // Cancelled reservations (today)
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          status: "CANCELLED",
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Checked in reservations (today)
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          status: "CHECKED_IN",
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      // Weekly reservations
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          date: {
            gte: weekStart,
            lt: tomorrow,
          },
        },
      }),
      // Monthly reservations
      prisma.reservation.count({
        where: {
          restaurantId: assignment.restaurantId,
          date: {
            gte: monthStart,
            lt: tomorrow,
          },
        },
      }),
      // Total tables
      prisma.table.count({
        where: {
          restaurantId: assignment.restaurantId,
        },
      }),
      // Active tables
      prisma.table.count({
        where: {
          restaurantId: assignment.restaurantId,
          isActive: true,
        },
      }),
      // Recent reservations (last 5)
      prisma.reservation.findMany({
        where: {
          restaurantId: assignment.restaurantId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          table: {
            select: {
              number: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      // Today's upcoming reservations
      prisma.reservation.findMany({
        where: {
          restaurantId: assignment.restaurantId,
          date: {
            gte: today,
            lt: tomorrow,
          },
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          table: {
            select: {
              number: true,
            },
          },
        },
        orderBy: {
          time: "asc",
        },
        take: 10,
      }),
    ]);

    // Calculate occupancy rate for today
    const totalCapacity = assignment.restaurant.capacity || activeTables * 4; // Estimate if not set
    const todayOccupancy =
      todayReservations > 0
        ? Math.round((todayReservations / (totalCapacity / 2)) * 100)
        : 0; // Rough estimate

    return NextResponse.json({
      stats: {
        // Basic stats
        todayReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        checkedInReservations,

        // Extended stats
        weeklyReservations,
        monthlyReservations,
        totalTables,
        activeTables,
        todayOccupancy,

        // Contextual data
        restaurantName: assignment.restaurant.name,
        restaurantCapacity: assignment.restaurant.capacity,
      },
      recentActivity: recentReservations.map((reservation) => ({
        id: reservation.id,
        customerName: reservation.user.name,
        customerEmail: reservation.user.email,
        date: reservation.date,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status,
        tableNumber: reservation.table?.number,
        createdAt: reservation.createdAt,
      })),
      todayUpcoming: todayUpcomingReservations.map((reservation) => ({
        id: reservation.id,
        customerName: reservation.user.name,
        customerEmail: reservation.user.email,
        time: reservation.time,
        partySize: reservation.partySize,
        status: reservation.status,
        tableNumber: reservation.table?.number,
        specialNotes: reservation.specialNotes,
      })),
    });
  } catch (error) {
    console.error("Error fetching reception stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
