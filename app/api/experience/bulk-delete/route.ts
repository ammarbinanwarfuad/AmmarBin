import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Experience from "@/models/Experience";
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

    const experiencesToDelete = await Experience.find({ _id: { $in: ids } });

    if (experiencesToDelete.length === 0) {
      return NextResponse.json(
        { error: "No experiences found to delete" },
        { status: 404 }
      );
    }

    const result = await Experience.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "experiences",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} experience(s)`,
      metadata: {
        count: result.deletedCount,
        companyNames: experiencesToDelete.map((e) => e.company),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('experience');

    return NextResponse.json({
      message: `${result.deletedCount} experience(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting experiences:", error);
    return NextResponse.json(
      { error: "Failed to delete experiences" },
      { status: 500 }
    );
  }
}

