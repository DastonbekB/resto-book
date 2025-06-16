import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const time = searchParams.get("time");

    // Get restaurant details with tables
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id: id,
        isActive: true,
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        tables: {
          where: {
            isActive: true,
          },
          orderBy: {
            number: "asc",
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get table availability
    const tableAvailability: Record<string, boolean> = {};
    const currentOccupancy: Record<string, string> = {}; // Track what status is occupying each table

    if (date && time) {
      // If specific date and time are provided, check availability for that slot
      const reservationDate = new Date(date);

      const existingReservations = await prisma.reservation.findMany({
        where: {
          restaurantId: id,
          date: reservationDate,
          time: time,
          status: {
            in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
          },
        },
        select: {
          tableId: true,
          status: true,
        },
      });

      const reservedTableIds = new Set(
        existingReservations.map((r) => r.tableId).filter(Boolean)
      );

      // Mark table availability and track occupancy
      restaurant.tables.forEach((table) => {
        const isReserved = reservedTableIds.has(table.id);
        tableAvailability[table.id] = !isReserved;

        if (isReserved) {
          const reservation = existingReservations.find(
            (r) => r.tableId === table.id
          );
          currentOccupancy[table.id] = reservation?.status || "RESERVED";
        }
      });
    } else {
      // If no specific date/time, show current day availability
      const today = new Date();
      const currentHour = today.getHours();

      const todayReservations = await prisma.reservation.findMany({
        where: {
          restaurantId: id,
          date: {
            gte: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            ),
            lt: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + 1
            ),
          },
          status: {
            in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
          },
        },
        select: {
          tableId: true,
          status: true,
          time: true,
        },
      });

      // Check which tables are currently occupied (based on current time)
      restaurant.tables.forEach((table) => {
        const currentReservation = todayReservations.find((r) => {
          if (r.tableId !== table.id) return false;

          const [reservationHour] = r.time.split(":").map(Number);
          const timeDiff = Math.abs(currentHour - reservationHour);

          // Consider table occupied if reservation is within 2 hours (before or after)
          return (
            timeDiff <= 2 && ["CONFIRMED", "CHECKED_IN"].includes(r.status)
          );
        });

        tableAvailability[table.id] = !currentReservation;

        if (currentReservation) {
          currentOccupancy[table.id] = currentReservation.status;
        }
      });
    }

    // Transform the data for frontend consumption
    const restaurantDetails = {
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      location: restaurant.location,
      region: restaurant.region,
      district: restaurant.district,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      website: restaurant.website,
      mapLink: restaurant.mapLink,
      images: restaurant.images
        ? (() => {
            // Handle different image storage formats
            if (Array.isArray(restaurant.images)) {
              return restaurant.images;
            }
            if (typeof restaurant.images === "string") {
              try {
                const parsed = JSON.parse(restaurant.images);
                return Array.isArray(parsed) ? parsed : [];
              } catch {
                return restaurant.images.split(",").filter((img) => img.trim());
              }
            }
            return [];
          })()
        : [],
      openingHours: restaurant.openingHours,
      priceRange: restaurant.priceRange,
      cuisine: restaurant.cuisine,
      capacity: restaurant.capacity,
      isFeatured: restaurant.isFeatured,
      owner: restaurant.owner,
      tables: restaurant.tables.map((table) => ({
        id: table.id,
        number: table.number,
        capacity: table.capacity,
        isAvailable: tableAvailability[table.id] ?? true,
        currentStatus: currentOccupancy[table.id] || null,
      })),
      totalReservations: restaurant._count.reservations,
      rating: 4.5, // Placeholder - implement real rating system later
      reviews: Math.floor(Math.random() * 100) + 10,
    };

    return NextResponse.json({ restaurant: restaurantDetails });
  } catch (error) {
    console.error("Error fetching restaurant details:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant details" },
      { status: 500 }
    );
  }
}
