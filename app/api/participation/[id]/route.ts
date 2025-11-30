import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Participation from "@/models/Participation";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    await Participation.findByIdAndDelete(id);

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('participation');

    return NextResponse.json({ message: "Participation deleted successfully" });
  } catch (error) {
    console.error("Error deleting participation:", error);
    return NextResponse.json(
      { error: "Failed to delete participation" },
      { status: 500 }
    );
  }
}

