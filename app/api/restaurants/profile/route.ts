import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Check if restaurant already exists for this user
    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (existingRestaurant) {
      return NextResponse.json(
        { error: "Restaurant already exists" },
        { status: 400 }
      );
    }

    const restaurant = await prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description || null,
        location: data.location,
        region: data.region || null,
        district: data.district || null,
        address: data.address || null,
        mapLink: data.mapLink || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        images: data.images || "[]",
        openingHours: data.openingHours || null,
        priceRange: data.priceRange || null,
        cuisine: data.cuisine || null,
        capacity: data.capacity || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        ownerId: session.user.id,
      },
    });

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Error creating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const restaurant = await prisma.restaurant.findFirst({
      where: {
        ownerId: session.user.id,
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: {
        id: restaurant.id,
      },
      data: {
        name: data.name,
        description: data.description || null,
        location: data.location,
        region: data.region || null,
        district: data.district || null,
        address: data.address || null,
        mapLink: data.mapLink || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        images: data.images || "[]",
        openingHours: data.openingHours || null,
        priceRange: data.priceRange || null,
        cuisine: data.cuisine || null,
        capacity: data.capacity || null,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    });

    return NextResponse.json(updatedRestaurant);
  } catch (error) {
    console.error("Error updating restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
