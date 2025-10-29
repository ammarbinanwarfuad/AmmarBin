import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Experience from "@/models/Experience";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET() {
  try {
    // Use unstable_cache for server-side caching (10 minutes TTL)
    const getCachedExperiences = unstable_cache(
      async () => {
    await connectDB();
        return await Experience.find()
      .sort({ order: 1, startDate: -1 })
      .lean()
          .maxTimeMS(500);
      },
      ['experience:all'],
      {
        tags: ['experience'],
        revalidate: 600, // 10 minutes
      }
    );

    const experiences = await getCachedExperiences();
      
    return NextResponse.json(
      { experiences },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return NextResponse.json(
      { error: "Failed to fetch experiences" },
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
    const experience = await Experience.create(data);
    
    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('experience');
    
    return NextResponse.json({ experience }, { status: 201 });
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
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
        { error: "Experience ID is required" },
        { status: 400 }
      );
    }

    const experience = await Experience.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!experience) {
      return NextResponse.json(
        { error: "Experience not found" },
        { status: 404 }
      );
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('experience');

    return NextResponse.json({ experience });
  } catch (error) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}

