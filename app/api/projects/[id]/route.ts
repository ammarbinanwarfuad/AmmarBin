import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();
    
    // Clean up empty strings - convert to undefined so Mongoose preserves existing values
    const updateData: Record<string, unknown> = { ...data };
    
    // For optional fields, if empty string, don't update (preserve existing)
    // EXCEPT for category - we want to allow empty category to be set explicitly
    if (updateData.description === "") delete updateData.description;
    if (Array.isArray(updateData.techStack) && updateData.techStack.length === 0) {
      delete updateData.techStack;
    }
    if (updateData.liveUrl === "") delete updateData.liveUrl;
    if (updateData.githubUrl === "") delete updateData.githubUrl;
    if (updateData.image === "") delete updateData.image;
    // Category: Allow empty string to explicitly clear category, but preserve if not provided
    // If category is explicitly set to "" (empty string), we keep it to clear the category
    
    // Required fields should always be included
    // Mongoose will only update fields that are in updateData
    
    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

