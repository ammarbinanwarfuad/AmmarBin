import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { logActivity } from "@/lib/activity-logger";

export async function DELETE(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Count projects before deletion for activity logging
    const projectCount = await Project.countDocuments();

    if (projectCount === 0) {
      return NextResponse.json(
        { error: "No projects found to delete" },
        { status: 404 }
      );
    }

    // Delete all projects
    const result = await Project.deleteMany({});

    // Log activity for delete all
    await logActivity({
      action: "delete",
      entityType: "projects",
      entityId: "delete-all",
      entityTitle: `Delete all: ${result.deletedCount} project(s)`,
      metadata: {
        count: result.deletedCount,
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      message: `${result.deletedCount} project(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all projects:", error);
    return NextResponse.json(
      { error: "Failed to delete projects" },
      { status: 500 }
    );
  }
}

