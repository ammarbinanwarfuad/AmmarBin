import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (data.title !== undefined && !data.title.trim()) {
      return NextResponse.json(
        { error: "Title is required", message: "Title cannot be empty" },
        { status: 400 }
      );
    }
    if (data.description !== undefined && !data.description.trim()) {
      return NextResponse.json(
        { error: "Description is required", message: "Description cannot be empty" },
        { status: 400 }
      );
    }
    
    // Clean up empty strings - but allow explicit clearing for some fields
    const updateData: Record<string, unknown> = { ...data };
    
    // For optional fields that should be explicitly clearable (set to empty string)
    // - image: allow clearing to remove image
    // - category: allow clearing to remove category
    // - liveUrl, githubUrl: allow clearing
    
    // For fields that should NOT be updated if empty:
    if (updateData.description === "") delete updateData.description;
    if (Array.isArray(updateData.techStack) && updateData.techStack.length === 0) {
      delete updateData.techStack;
    }
    
    // Image, liveUrl, githubUrl, category: Allow empty string to explicitly clear
    // Keep empty strings for these fields - don't delete them
    
    // Auto-generate slug if title changed and slug not provided
    if (data.title && !data.slug) {
      const newSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Ensure unique slug (excluding current project)
      let slugExists = await Project.findOne({ slug: newSlug, _id: { $ne: id } });
      let counter = 1;
      const baseSlug = newSlug;
      let finalSlug = newSlug;
      while (slugExists) {
        finalSlug = `${baseSlug}-${counter}`;
        slugExists = await Project.findOne({ slug: finalSlug, _id: { $ne: id } });
        counter++;
      }
      updateData.slug = finalSlug;
    }
    
    // Required fields should always be included
    // Mongoose will only update fields that are in updateData
    
    const project = await Project.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('projects');

    return NextResponse.json({ project, message: "Project updated successfully" });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      { error: "Failed to update project", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('projects');

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      { error: "Failed to delete project", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

