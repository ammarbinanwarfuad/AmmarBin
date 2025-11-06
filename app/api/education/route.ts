import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Education from "@/models/Education";
import { logActivity } from "@/lib/activity-logger";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET() {
  try {
    // Use unstable_cache for server-side caching (10 minutes TTL)
    const getCachedEducation = unstable_cache(
      async () => {
    await connectDB();
        return await Education.find()
      .sort({ order: 1, startDate: -1 })
      .lean()
          .maxTimeMS(500);
      },
      ['education:all'],
      {
        tags: ['education'],
        revalidate: 600, // 10 minutes
      }
    );

    const education = await getCachedEducation();
    
    return NextResponse.json(
      { education },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
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

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('education');
    
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

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('education');

    return NextResponse.json({ education: edu });
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json(
      { error: "Failed to update education" },
      { status: 500 }
    );
  }
}

