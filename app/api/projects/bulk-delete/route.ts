import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
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

    // Fetch projects before deletion for activity logging
    const projectsToDelete = await Project.find({ _id: { $in: ids } });

    if (projectsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No projects found to delete" },
        { status: 404 }
      );
    }

    // Delete all selected projects
    const result = await Project.deleteMany({ _id: { $in: ids } });

    // Log activity for bulk delete
    await logActivity({
      action: "delete",
      entityType: "projects",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} project(s)`,
      metadata: {
        count: result.deletedCount,
        projectTitles: projectsToDelete.map((p) => p.title),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('projects');

    return NextResponse.json({
      message: `${result.deletedCount} project(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting projects:", error);
    return NextResponse.json(
      { error: "Failed to delete projects" },
      { status: 500 }
    );
  }
}

