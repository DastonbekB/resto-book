import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const tableId = (await params).id;

    // Get the restaurant owned by the user
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

    // Check if the table belongs to the user's restaurant
    const existingTable = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId: restaurant.id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Check if the new table number conflicts with another table
    if (data.number !== existingTable.number) {
      const conflictingTable = await prisma.table.findFirst({
        where: {
          restaurantId: restaurant.id,
          number: data.number,
          id: { not: tableId },
        },
      });

      if (conflictingTable) {
        return NextResponse.json(
          { error: "Table number already exists" },
          { status: 400 }
        );
      }
    }

    const updatedTable = await prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        number: data.number,
        capacity: data.capacity,
        isActive: data.isActive ?? true,
      },
    });

    return NextResponse.json(updatedTable);
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tableId = (await params).id;

    // Get the restaurant owned by the user
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

    // Check if the table belongs to the user's restaurant
    const existingTable = await prisma.table.findFirst({
      where: {
        id: tableId,
        restaurantId: restaurant.id,
      },
    });

    if (!existingTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // Check if there are any reservations for this table
    const reservations = await prisma.reservation.findMany({
      where: {
        tableId: tableId,
        status: {
          in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
        },
      },
    });

    if (reservations.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete table with active reservations" },
        { status: 400 }
      );
    }

    await prisma.table.delete({
      where: {
        id: tableId,
      },
    });

    return NextResponse.json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
