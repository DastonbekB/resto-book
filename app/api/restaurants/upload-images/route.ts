import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.formData();
    const files: File[] = data.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const imageUrls: string[] = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "restaurants");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error("Error creating uploads directory:", error);
      // Directory already exists
    }

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = file.name.split(".").pop();
      const filename = `restaurant-${uniqueSuffix}.${fileExtension}`;

      const filepath = join(uploadsDir, filename);
      await writeFile(filepath, buffer);

      // Create the URL path
      const imageUrl = `/uploads/restaurants/${filename}`;
      imageUrls.push(imageUrl);
    }

    return NextResponse.json({ imageUrls });
  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Find the restaurant owned by the current user
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

    // Parse current images
    let currentImages: string[] = [];
    try {
      currentImages = JSON.parse(restaurant.images || "[]");
    } catch (error) {
      console.error("Error parsing images:", error);
      currentImages = [];
    }

    // Check if the image exists in the restaurant's images
    if (!currentImages.includes(imageUrl)) {
      return NextResponse.json(
        { error: "Image not found in restaurant" },
        { status: 404 }
      );
    }

    // Remove the image from the array
    const updatedImages = currentImages.filter((img) => img !== imageUrl);

    // Update the database
    await prisma.restaurant.update({
      where: {
        id: restaurant.id,
      },
      data: {
        images: JSON.stringify(updatedImages),
      },
    });

    // Delete the actual file from filesystem
    try {
      // Extract filename from URL (e.g., "/uploads/restaurants/filename.jpg" -> "filename.jpg")
      const filename = imageUrl.split("/").pop();
      if (filename) {
        const filepath = join(
          process.cwd(),
          "public",
          "uploads",
          "restaurants",
          filename
        );
        await unlink(filepath);
      }
    } catch (fileError) {
      // File might not exist or already deleted, but database update succeeded
      console.warn("Could not delete image file:", fileError);
    }

    return NextResponse.json({
      success: true,
      updatedImages,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
