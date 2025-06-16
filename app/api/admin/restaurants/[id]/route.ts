import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { formatFullAddress } from "@/lib/uzbekistan-regions";
import { Prisma } from "@prisma/client";

const updateRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().min(1, "Description is required"),
  // Legacy location field for backward compatibility
  location: z.string().optional(),
  // New structured address fields
  region: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  mapLink: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email("Valid email is required").optional(),
  website: z.string().url("Valid website URL").optional().or(z.literal("")),
  cuisine: z.string().optional(),
  priceRange: z.string().optional(),
  capacity: z.number().positive("Capacity must be positive").optional(),
  openingHours: z.string().optional(),
  images: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// GET - Fetch individual restaurant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id: restaurantId } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
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
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ restaurant });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
}

// PUT - Update restaurant
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id: restaurantId } = await params;
    const body = await request.json();
    const validatedData = updateRestaurantSchema.parse(body);

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Check if email is already taken by another restaurant
    if (
      validatedData.email &&
      validatedData.email !== existingRestaurant.email
    ) {
      const emailExists = await prisma.restaurant.findFirst({
        where: {
          email: validatedData.email,
          id: { not: restaurantId },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email is already taken by another restaurant" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Prisma.RestaurantUpdateInput = {
      name: validatedData.name,
      description: validatedData.description,
    };

    // Handle location fields - if new structured fields are provided, use them
    if (validatedData.region && validatedData.district) {
      const fullAddress = formatFullAddress(
        validatedData.region,
        validatedData.district,
        validatedData.address
      );
      updateData.location = fullAddress; // Update legacy field for backward compatibility
      updateData.region = validatedData.region;
      updateData.district = validatedData.district;
      updateData.address = validatedData.address || "";
    } else if (validatedData.location) {
      // Fallback to legacy location field
      updateData.location = validatedData.location;
    }

    // Add optional fields if provided
    if (validatedData.mapLink !== undefined)
      updateData.mapLink = validatedData.mapLink;
    if (validatedData.phone !== undefined)
      updateData.phone = validatedData.phone;
    if (validatedData.email !== undefined)
      updateData.email = validatedData.email;
    if (validatedData.website !== undefined)
      updateData.website = validatedData.website;
    if (validatedData.cuisine !== undefined)
      updateData.cuisine = validatedData.cuisine;
    if (validatedData.priceRange !== undefined)
      updateData.priceRange = validatedData.priceRange;
    if (validatedData.capacity !== undefined)
      updateData.capacity = validatedData.capacity;
    if (validatedData.openingHours !== undefined)
      updateData.openingHours = validatedData.openingHours;
    if (validatedData.images !== undefined)
      updateData.images = validatedData.images;
    if (validatedData.isActive !== undefined)
      updateData.isActive = validatedData.isActive;
    if (validatedData.isFeatured !== undefined)
      updateData.isFeatured = validatedData.isFeatured;

    // Update restaurant
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updateData,
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
    });

    return NextResponse.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
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

// DELETE - Delete restaurant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    const { id: restaurantId } = await params;

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        _count: {
          select: {
            reservations: true,
            tables: true,
          },
        },
      },
    });

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Check if restaurant has active reservations
    if (existingRestaurant._count.reservations > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete restaurant with existing reservations. Please cancel all reservations first.",
          reservationsCount: existingRestaurant._count.reservations,
        },
        { status: 400 }
      );
    }

    // Delete restaurant (this will cascade delete tables due to foreign key constraints)
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    return NextResponse.json({
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    return NextResponse.json(
      { error: "Failed to delete restaurant" },
      { status: 500 }
    );
  }
}
