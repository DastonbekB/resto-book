import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: assignmentId } = await params;

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

    // Check if the assignment belongs to the user's restaurant
    const existingAssignment = await prisma.receptionistAssignment.findFirst({
      where: {
        id: assignmentId,
        restaurantId: restaurant.id,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Staff assignment not found" },
        { status: 404 }
      );
    }

    // Delete the assignment
    await prisma.receptionistAssignment.delete({
      where: {
        id: assignmentId,
      },
    });

    return NextResponse.json({ message: "Staff member removed successfully" });
  } catch (error) {
    console.error("Error removing staff:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
