import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Education from "@/models/Education";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  try {
    await connectDB();
    const education = await Education.find()
      .sort({ order: 1, startDate: -1 })
      .lean()
      .maxTimeMS(500); // Timeout for faster TTFB
    
    const headers: HeadersInit = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    };
    
    return NextResponse.json(
      { education },
      { headers }
    );
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json(
      { error: "Failed to fetch education" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const edu = await Education.create(data);

    // Log activity
    await logActivity({
      action: "create",
      entityType: "education",
      entityId: edu._id.toString(),
      entityTitle: `${data.degree} in ${data.field}`,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });
    
    return NextResponse.json({ education: edu }, { status: 201 });
  } catch (error) {
    console.error("Error creating education:", error);
    return NextResponse.json(
      { error: "Failed to create education" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    const { _id, ...updateData } = data;
    
    if (!_id) {
      return NextResponse.json(
        { error: "Education ID is required" },
        { status: 400 }
      );
    }

    const edu = await Education.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!edu) {
      return NextResponse.json(
        { error: "Education not found" },
        { status: 404 }
      );
    }


    // Log activity
    await logActivity({
      action: "update",
      entityType: "education",
      entityId: _id,
      entityTitle: `${updateData.degree || edu.degree} in ${updateData.field || edu.field}`,
      changes: updateData,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ education: edu });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education" },
      { status: 500 }
    );
  }
}

