import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Certificate from "@/models/Certificate";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    // Build query
    // If admin is authenticated, show all certificates (including unpublished)
    // Otherwise, only show published certificates
    const query: Record<string, unknown> = {};
    if (!session) {
      query.published = true; // Only show published certificates for public users
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { issuer: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    // Create cache key based on query parameters
    const cacheKey = `certifications:${JSON.stringify(query)}:${search || ''}`;

    // Use unstable_cache for server-side caching
    const getCachedCertifications = unstable_cache(
      async () => {
        await connectDB();

    const certificates = await Certificate.find(query)
      .sort({ issueDate: -1 })
      .lean()
          .maxTimeMS(500);

    // Calculate stats - only count published certificates for public users
    const statsQuery: Record<string, unknown> = session ? {} : { published: true };
    const totalCertificates = await Certificate.countDocuments(statsQuery);
    const now = new Date();
    const activeCertificates = await Certificate.countDocuments({
      ...statsQuery,
      $or: [{ expiryDate: null }, { expiryDate: { $gt: now } }],
    });
    const expiredCertificates = await Certificate.countDocuments({
      ...statsQuery,
      expiryDate: { $lte: now },
    });

    // Get categories with counts - only from published certificates for public users
    const categoryMatch = session ? {} : { published: true };
    const categoriesData = await Certificate.aggregate([
      {
        $match: categoryMatch,
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const stats = {
      total: totalCertificates,
      active: activeCertificates,
      expired: expiredCertificates,
      categories: categoriesData,
    };

        return { certificates, stats };
      },
      [cacheKey],
      {
        tags: ['certifications'],
        revalidate: 600, // 10 minutes
      }
    );

    const { certificates, stats } = await getCachedCertifications();

    return NextResponse.json(
      { certificates, stats },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    await connectDB();

    const certificate = await Certificate.create(data);

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('certifications');

    return NextResponse.json(
      { message: "Certificate created successfully", certificate },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating certificate:", error);
    return NextResponse.json(
      { error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { _id, ...updateData } = data;

    await connectDB();

    const certificate = await Certificate.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('certifications');

    return NextResponse.json({
      message: "Certificate updated successfully",
      certificate,
    });
  } catch (error) {
    console.error("Error updating certificate:", error);
    return NextResponse.json(
      { error: "Failed to update certificate" },
      { status: 500 }
    );
  }
}

