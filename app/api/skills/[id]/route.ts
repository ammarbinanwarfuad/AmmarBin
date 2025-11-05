import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Skill from "@/models/Skill";
import { logActivity } from "@/lib/activity-logger";

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
    
    const skill = await Skill.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Revalidate pages that show skills - use 'layout' type to force immediate revalidation

    // Log activity
    await logActivity({
      action: "update",
      entityType: "skill",
      entityId: id,
      entityTitle: data.name || skill.name,
      changes: data,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error("Error updating skill:", error);
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    
    // Use findByIdAndDelete which returns the deleted document or null
    const deleted = await Skill.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    // Log activity (don't let logging errors prevent deletion)
    try {
      await logActivity({
        action: "delete",
        entityType: "skill",
        entityId: id,
        entityTitle: deleted.name,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });
    } catch (error) {
      // Log but don't fail the request if activity logging fails
      console.warn("Activity logging failed:", error);
    }

    return NextResponse.json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}

