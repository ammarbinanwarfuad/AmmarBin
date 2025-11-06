import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Participation from "@/models/Participation";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET() {
  try {
    // Use unstable_cache for server-side caching (10 minutes TTL)
    const getCachedParticipations = unstable_cache(
      async () => {
    await connectDB();
        return await Participation.find()
          .sort({ order: 1, startDate: -1 })
          .lean();
      },
      ['participation:all'],
      {
        tags: ['participation'],
        revalidate: 600, // 10 minutes
      }
    );

    const participations = await getCachedParticipations();
    
    return NextResponse.json(
      { participations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching participations:", error);
    return NextResponse.json(
      { error: "Failed to fetch participations" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const participation = await Participation.create(data);
    
    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('participation');
    
    return NextResponse.json({ participation }, { status: 201 });
  } catch (error) {
    console.error("Error creating participation:", error);
    return NextResponse.json(
      { error: "Failed to create participation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const { _id, ...updateData } = data;
    
    if (!_id) {
      return NextResponse.json(
        { error: "Participation ID is required" },
        { status: 400 }
      );
    }

    const participation = await Participation.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!participation) {
      return NextResponse.json(
        { error: "Participation not found" },
        { status: 404 }
      );
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('participation');

    return NextResponse.json({ participation });
  } catch (error) {
    console.error("Error updating participation:", error);
    return NextResponse.json(
      { error: "Failed to update participation" },
      { status: 500 }
    );
  }
}

