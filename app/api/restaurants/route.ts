import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const cuisine = searchParams.get("cuisine");
    const location = searchParams.get("location");
    const region = searchParams.get("region");
    const district = searchParams.get("district");
    const priceRange = searchParams.get("priceRange");
    const featured = searchParams.get("featured");

    // Build where clause for filtering
    const whereClause: Prisma.RestaurantWhereInput = {
      isActive: true,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { cuisine: { contains: search } },
        { location: { contains: search } },
        { region: { contains: search } },
        { district: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (cuisine) {
      whereClause.cuisine = { contains: cuisine };
    }

    if (location) {
      whereClause.location = { contains: location };
    }

    if (region) {
      whereClause.region = { contains: region };
    }

    if (district) {
      whereClause.district = { contains: district };
    }

    if (priceRange) {
      whereClause.priceRange = priceRange;
    }

    if (featured === "true") {
      whereClause.isFeatured = true;
    }

    const restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            name: true,
          },
        },
        tables: {
          select: {
            id: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    });

    // Transform the data for frontend consumption
    const transformedRestaurants = restaurants.map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      description: restaurant.description,
      location: restaurant.location,
      region: restaurant.region,
      district: restaurant.district,
      address: restaurant.address,
      mapLink: restaurant.mapLink,
      phone: restaurant.phone,
      email: restaurant.email,
      website: restaurant.website,
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
      owner: restaurant.owner.name,
      totalTables: restaurant.tables.length,
      totalCapacity: restaurant.tables.reduce(
        (sum, table) => sum + table.capacity,
        0
      ),
      totalReservations: restaurant._count.reservations,
      rating: 4.5, // Placeholder - you can implement a real rating system later
      reviews: Math.floor(Math.random() * 100) + 10, // Placeholder
      createdAt: restaurant.createdAt,
    }));

    return NextResponse.json({
      restaurants: transformedRestaurants,
      total: transformedRestaurants.length,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}
