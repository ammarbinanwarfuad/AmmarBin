import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { logActivity } from "@/lib/activity-logger";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const mongoose = await import("mongoose");
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    const backup: Record<string, unknown[]> = {};

    for (const collection of collections) {
      const collectionName = collection.name;
      // Skip system collections
      if (collectionName.startsWith("system.")) continue;
      
      const data = await db.collection(collectionName).find({}).toArray();
      backup[collectionName] = data;
    }

    // Log activity
    await logActivity({
      action: "backup",
      entityType: "database",
      entityId: "full",
      entityTitle: "Full Database Backup",
      metadata: {
        collections: Object.keys(backup),
        totalDocuments: Object.values(backup).reduce((sum, arr) => sum + arr.length, 0),
      },
    });

    return NextResponse.json({
      success: true,
      backup,
      timestamp: new Date().toISOString(),
      collections: Object.keys(backup),
      totalDocuments: Object.values(backup).reduce((sum, arr) => sum + arr.length, 0),
    });
  } catch (error) {
    console.error("Error creating backup:", error);
    return NextResponse.json(
      { error: "Failed to create backup" },
      { status: 500 }
    );
  }
}

