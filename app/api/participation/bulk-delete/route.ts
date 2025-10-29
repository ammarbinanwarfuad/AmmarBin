import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Participation from "@/models/Participation";
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

    const participationsToDelete = await Participation.find({ _id: { $in: ids } });

    if (participationsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No participations found to delete" },
        { status: 404 }
      );
    }

    const result = await Participation.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "participations",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} participation(s)`,
      metadata: {
        count: result.deletedCount,
        titles: participationsToDelete.map((p) => p.title || p.organization),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('participation');

    return NextResponse.json({
      message: `${result.deletedCount} participation(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting participations:", error);
    return NextResponse.json(
      { error: "Failed to delete participations" },
      { status: 500 }
    );
  }
}

