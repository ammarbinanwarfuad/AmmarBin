import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    
    const certificate = await Certificate.findByIdAndUpdate(
      id,
      { published },
      { new: true }
    );

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Revalidate paths (fire and forget - don't block response)
    
    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Error toggling certificate publish status:", error);
    return NextResponse.json(
      { error: "Failed to update certificate publish status" },
      { status: 500 }
    );
  }
}

