import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import ExternalBlog from "@/models/ExternalBlog";
import { logActivity } from "@/lib/activity-logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const source = body.source;

    let blog = null;
    let blogTitle = "";

    // Delete based on source type
    if (source === "hashnode" || source === "gucc" || source === "external") {
      // Delete external blog
      blog = await ExternalBlog.findByIdAndDelete(id);
      if (blog) {
        blogTitle = blog.title;
      }
    } else {
      // Delete internal blog (default behavior)
      blog = await Blog.findByIdAndDelete(id);
      if (blog) {
        blogTitle = blog.title;
      }
    }

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    // Log activity
    await logActivity({
      action: "delete",
      entityType: "blogs",
      entityId: id,
      entityTitle: blogTitle,
      metadata: { source: source || "internal" },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const data = await request.json();

    const blog = await Blog.findByIdAndUpdate(
      id,
      { ...data, publishedDate: data.published ? new Date() : undefined },
      { new: true }
    );

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ blog, message: "Blog post updated successfully" });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}
