import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
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

    const blogsToDelete = await Blog.find({ _id: { $in: ids } });

    if (blogsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No blogs found to delete" },
        { status: 404 }
      );
    }

    const result = await Blog.deleteMany({ _id: { $in: ids } });

    await logActivity({
      action: "delete",
      entityType: "blogs",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} blog(s)`,
      metadata: {
        count: result.deletedCount,
        titles: blogsToDelete.map((b) => b.title),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('blog');

    return NextResponse.json({
      message: `${result.deletedCount} blog(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting blogs:", error);
    return NextResponse.json(
      { error: "Failed to delete blogs" },
      { status: 500 }
    );
  }
}

