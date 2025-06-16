import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { formatFullAddress } from "@/lib/uzbekistan-regions";
import { Prisma } from "@prisma/client";

const updateRestaurantSchema = z.object({
  id: z.string(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

const createRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().optional(),
  region: z.string().min(1, "Region is required"),
  district: z.string().min(1, "District is required"),
  mapLink: z.string().url().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  openingHours: z.string().optional(),
  images: z.string().optional(),
  featured: z.boolean().optional(),
});

const deleteRestaurantSchema = z.object({
  id: z.string(),
});

// GET - Fetch all restaurants with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const isActive = searchParams.get("isActive");
    const isFeatured = searchParams.get("isFeatured");
    const ownerId = searchParams.get("ownerId");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.RestaurantWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { cuisine: { contains: search } },
        { region: { contains: search } },
        { district: { contains: search } },
        { address: { contains: search } },
      ];
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }
    if (isFeatured !== null && isFeatured !== undefined) {
      where.isFeatured = isFeatured === "true";
    }
    if (ownerId) {
      where.ownerId = ownerId;
    }

    // Get restaurants with pagination
    const [restaurants, totalCount] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              tables: true,
              reservations: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.restaurant.count({ where }),
    ]);

    // Get restaurant statistics
    const stats = await prisma.restaurant.aggregate({
      _count: true,
      _avg: {
        capacity: true,
      },
    });

    const statusStats = await prisma.restaurant.groupBy({
      by: ["isActive", "isFeatured"],
      _count: true,
    });

    return NextResponse.json({
      restaurants,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      stats: {
        total: stats._count,
        averageCapacity: stats._avg.capacity,
        statusBreakdown: statusStats,
      },
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
}

// PUT - Update restaurant status (approve/disapprove, feature/unfeature)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateRestaurantSchema.parse(body);

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.id },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Update restaurant
    const updateData: {
      isActive?: boolean;
      isFeatured?: boolean;
    } = {};
    if (validatedData.isActive !== undefined) {
      updateData.isActive = validatedData.isActive;
    }
    if (validatedData.isFeatured !== undefined) {
      updateData.isFeatured = validatedData.isFeatured;
    }

    const restaurant = await prisma.restaurant.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to update restaurant" },
      { status: 500 }
    );
  }
}

// POST - Create new restaurant
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRestaurantSchema.parse(body);

    // Check if restaurant with same email already exists
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: { email: validatedData.email },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant with this email already exists" },
        { status: 400 }
      );
    }

    // Create a restaurant owner user account
    const ownerEmail = validatedData.email;
    const tempPassword = "Restaurant123!"; // Temporary password, should be changed on first login
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Check if user with this email already exists
    let owner = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });

    if (!owner) {
      // Create owner user if doesn't exist
      owner = await prisma.user.create({
        data: {
          name: `${validatedData.name} Owner`,
          email: ownerEmail,
          password: hashedPassword,
          role: "RESTAURANT_ADMIN",
        },
      });
    } else if (owner.role !== "RESTAURANT_ADMIN") {
      // Update existing user to restaurant admin if they're not already
      owner = await prisma.user.update({
        where: { id: owner.id },
        data: { role: "RESTAURANT_ADMIN" },
      });
    }

    // Format the full address for the location field (for backward compatibility)
    const fullAddress = formatFullAddress(
      validatedData.region,
      validatedData.district,
      validatedData.address
    );

    // Create the restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        location: fullAddress, // Formatted full address for backward compatibility
        region: validatedData.region,
        district: validatedData.district,
        address: validatedData.address || "",
        mapLink: validatedData.mapLink || "",
        phone: validatedData.phone,
        email: validatedData.email,
        openingHours: validatedData.openingHours || "",
        images: validatedData.images || "",
        isFeatured: validatedData.featured || false,
        isActive: true, // Auto-approve when created by super admin
        ownerId: owner.id,
        // Set some default values
        cuisine: "Various", // Default cuisine
        capacity: 50, // Default capacity
        priceRange: "$$$", // Default price range
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Restaurant created successfully",
      restaurant,
      ownerCredentials: {
        email: ownerEmail,
        temporaryPassword: tempPassword,
        note: "Please share these credentials with the restaurant owner and ask them to change the password on first login",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Failed to create restaurant" },
      { status: 500 }
    );
  }
}

// DELETE - Delete restaurant and all related data
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = deleteRestaurantSchema.parse(body);

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.id },
      include: {
        owner: true,
        tables: true,
        reservations: true,
      },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Get count of active reservations for info (but don't block deletion)
    const activeReservations = await prisma.reservation.count({
      where: {
        restaurantId: validatedData.id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
        date: {
          gte: new Date(), // Future reservations
        },
      },
    });

    // Start transaction to delete all related data
    await prisma.$transaction(async (prisma) => {
      // Cancel all future active reservations first
      await prisma.reservation.updateMany({
        where: {
          restaurantId: validatedData.id,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
          date: {
            gte: new Date(),
          },
        },
        data: {
          status: "CANCELLED",
        },
      });

      // Delete all check-ins related to reservations
      const reservationIds = await prisma.reservation.findMany({
        where: { restaurantId: validatedData.id },
        select: { id: true },
      });

      if (reservationIds.length > 0) {
        await prisma.checkIn.deleteMany({
          where: {
            reservationId: {
              in: reservationIds.map((r) => r.id),
            },
          },
        });
      }

      // Delete all reservations (including past ones)
      await prisma.reservation.deleteMany({
        where: { restaurantId: validatedData.id },
      });

      // Delete all tables
      await prisma.table.deleteMany({
        where: { restaurantId: validatedData.id },
      });

      // Delete all receptionist assignments (staff memberships)
      await prisma.receptionistAssignment.deleteMany({
        where: { restaurantId: validatedData.id },
      });

      // Delete all payments
      await prisma.payment.deleteMany({
        where: { restaurantId: validatedData.id },
      });

      // Delete the restaurant
      await prisma.restaurant.delete({
        where: { id: validatedData.id },
      });

      // Note: We don't delete the owner user as they might own other restaurants
      // or need to maintain their account for other purposes
    });

    return NextResponse.json({
      message: "Restaurant and all related data deleted successfully",
      deletedRestaurant: {
        id: existingRestaurant.id,
        name: existingRestaurant.name,
        tablesDeleted: existingRestaurant.tables.length,
        reservationsDeleted: existingRestaurant.reservations.length,
        activeReservationsCancelled: activeReservations,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
