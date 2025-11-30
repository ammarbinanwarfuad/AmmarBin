import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectDB();

    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('certifications');

    return NextResponse.json({
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}

