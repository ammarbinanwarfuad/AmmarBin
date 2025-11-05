import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity-logger";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { backup, clearExisting = false } = await request.json();

    if (!backup || typeof backup !== "object") {
      return NextResponse.json(
        { error: "Invalid backup data" },
        { status: 400 }
      );
    }

    const mongoose = await import("mongoose");
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const restored: Record<string, number> = {};

    for (const [collectionName, documents] of Object.entries(backup)) {
      if (!Array.isArray(documents)) continue;
      
      // Skip system collections
      if (collectionName.startsWith("system.")) continue;

      // Clear existing if requested (except Users collection for safety)
      if (clearExisting && collectionName !== "users") {
        await db.collection(collectionName).deleteMany({});
      }

      // Insert documents
      if (documents.length > 0) {
        await db.collection(collectionName).insertMany(documents);
      }
      
      restored[collectionName] = documents.length;
    }

    // Log activity
    await logActivity({
      action: "restore",
      entityType: "database",
      entityId: "full",
      entityTitle: "Database Restore",
      metadata: {
        collections: Object.keys(restored),
        documentsRestored: Object.values(restored).reduce((sum, count) => sum + count, 0),
        clearExisting,
      },
    });

    return NextResponse.json({
      success: true,
      restored,
      totalDocuments: Object.values(restored).reduce((sum, count) => sum + count, 0),
    });
  } catch (error) {
    console.error("Error restoring backup:", error);
    return NextResponse.json(
      { error: "Failed to restore backup" },
      { status: 500 }
    );
  }
}

