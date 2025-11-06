import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Education from "@/models/Education";
import { logActivity } from "@/lib/activity-logger";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Education.findById(id);
    await Education.findByIdAndDelete(id);


    // Log activity
    if (deleted) {
      await logActivity({
        action: "delete",
        entityType: "education",
        entityId: id,
        entityTitle: `${deleted.degree} in ${deleted.field}`,
        ipAddress: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      });
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('education');

    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json(
      { error: "Failed to delete education" },
      { status: 500 }
    );
  }
}

