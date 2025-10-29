import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { logActivity } from "@/lib/activity-logger";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty array of IDs" },
        { status: 400 }
      );
    }

    const certificatesToDelete = await Certificate.find({ _id: { $in: ids } });

    if (certificatesToDelete.length === 0) {
      return NextResponse.json(
        { error: "No certificates found to delete" },
        { status: 404 }
      );
    }

    const result = await Certificate.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "certifications",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} certificate(s)`,
      metadata: {
        count: result.deletedCount,
        titles: certificatesToDelete.map((c) => c.title),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('certifications');

    return NextResponse.json({
      message: `${result.deletedCount} certificate(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting certificates:", error);
    return NextResponse.json(
      { error: "Failed to delete certificates" },
      { status: 500 }
    );
  }
}

