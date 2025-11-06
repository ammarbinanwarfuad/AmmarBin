import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Education from "@/models/Education";
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

    const educationsToDelete = await Education.find({ _id: { $in: ids } });

    if (educationsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No education records found to delete" },
        { status: 404 }
      );
    }

    const result = await Education.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "education",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} education record(s)`,
      metadata: {
        count: result.deletedCount,
        institutions: educationsToDelete.map((e) => e.institution),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('education');

    return NextResponse.json({
      message: `${result.deletedCount} education record(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education records" },
      { status: 500 }
    );
  }
}

