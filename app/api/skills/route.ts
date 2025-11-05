import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Skill from "@/models/Skill";
import { logActivity } from "@/lib/activity-logger";

export async function GET() {
  try {
    await connectDB();
    const skills = await Skill.find()
      .sort({ category: 1, name: 1 })
      .lean()
      .maxTimeMS(500); // Timeout for faster TTFB
      
    return NextResponse.json(
      { skills },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching skills:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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

    const skill = await Skill.create(data);


    // Log activity
    await logActivity({
      action: "create",
      entityType: "skill",
      entityId: skill._id.toString(),
      entityTitle: data.name,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ skill }, { status: 201 });
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
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
        { error: "Skill ID is required" },
        { status: 400 }
      );
    }

    const skill = await Skill.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }


    // Log activity
    await logActivity({
      action: "update",
      entityType: "skill",
      entityId: _id,
      entityTitle: updateData.name || skill.name,
      changes: updateData,
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
