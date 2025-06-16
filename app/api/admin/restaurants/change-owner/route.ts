import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const changeOwnerSchema = z.object({
  restaurantId: z.string(),
  newOwnerId: z.string(),
});

// PUT - Change restaurant ownership
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
    const validatedData = changeOwnerSchema.parse(body);

    // Check if restaurant exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: validatedData.restaurantId },
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

    if (!existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Check if new owner exists and is a restaurant admin
    const newOwner = await prisma.user.findUnique({
      where: { id: validatedData.newOwnerId },
    });

    if (!newOwner) {
      return NextResponse.json(
        { error: "New owner not found" },
        { status: 404 }
      );
    }

    if (newOwner.role !== "RESTAURANT_ADMIN") {
      return NextResponse.json(
        { error: "New owner must have RESTAURANT_ADMIN role" },
        { status: 400 }
      );
    }

    // Update restaurant ownership
    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: validatedData.restaurantId },
      data: { ownerId: validatedData.newOwnerId },
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
      message: "Restaurant ownership changed successfully",
      restaurant: updatedRestaurant,
      previousOwner: existingRestaurant.owner,
      newOwner: {
        id: newOwner.id,
        name: newOwner.name,
        email: newOwner.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error changing restaurant ownership:", error);
    return NextResponse.json(
      { error: "Failed to change restaurant ownership" },
      { status: 500 }
    );
  }
}

// GET - Get available restaurant owners
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Super admin access required" },
        { status: 403 }
      );
    }

    // Get all users with RESTAURANT_ADMIN role
    const restaurantAdmins = await prisma.user.findMany({
      where: {
        role: "RESTAURANT_ADMIN",
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            ownedRestaurants: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      owners: restaurantAdmins,
    });
  } catch (error) {
    console.error("Error fetching restaurant owners:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant owners" },
      { status: 500 }
    );
  }
}
