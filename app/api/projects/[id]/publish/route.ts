import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { logActivity } from "@/lib/activity-logger";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    
    const { published } = await request.json();
    
    const project = await Project.findByIdAndUpdate(
      id,
      { published },
      { new: true }
    );

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Invalidate projects cache
    await invalidateCacheAfterUpdate('projects');
    
    // Log activity
    await logActivity({
      action: 'update',
      entityType: 'project',
      entityId: id,
      entityTitle: project.title,
      changes: { published },
    });

    return NextResponse.json({ project, message: `Project ${published ? 'published' : 'unpublished'} successfully` });
  } catch (error) {
    console.error("Error toggling project publish status:", error);
    return NextResponse.json(
      { error: "Failed to update project publish status", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

