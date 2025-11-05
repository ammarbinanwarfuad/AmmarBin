import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Skill from "@/models/Skill";
import { logActivity } from "@/lib/activity-logger";

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

    // Fetch skills before deletion for activity logging
    const skillsToDelete = await Skill.find({ _id: { $in: ids } });

    if (skillsToDelete.length === 0) {
      return NextResponse.json(
        { error: "No skills found to delete" },
        { status: 404 }
      );
    }

    // Delete all selected skills
    const result = await Skill.deleteMany({ _id: { $in: ids } });

    // Log activity for bulk delete
    await logActivity({
      action: "delete",
      entityType: "skills",
      entityId: "bulk-delete",
      entityTitle: `Bulk delete: ${result.deletedCount} skill(s)`,
      metadata: {
        count: result.deletedCount,
        skillNames: skillsToDelete.map((s) => s.name),
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      message: `${result.deletedCount} skill(s) deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting skills:", error);
    return NextResponse.json(
      { error: "Failed to delete skills" },
      { status: 500 }
    );
  }
}

