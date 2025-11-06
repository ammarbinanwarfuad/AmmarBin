import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";
import { createETagResponse } from "@/lib/etag";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const topicsParam = searchParams.get("topics");

    // If admin is authenticated, show all projects (including unpublished)
    // Otherwise, only show published projects
    const query: Record<string, unknown> = {};
    if (!session) {
      query.published = true; // Only show published projects for public users
    }
    
    if (category) query.category = category;
    if (featured === "true") query.featured = true;
    if (topicsParam) {
      const topics = topicsParam
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (topics.length > 0) {
        // AND semantics
        (query as Record<string, unknown>).topics = { $all: topics };
      }
    }

    // Create cache key based on query parameters
    const cacheKey = `projects:${JSON.stringify(query)}`;
    
    // Use unstable_cache for server-side caching (5 minutes TTL)
    // Cache is invalidated automatically when content is updated via invalidateCacheAfterUpdate
    const getCachedProjects = unstable_cache(
      async () => {
        await connectDB();
        return await Project.find(query)
      .sort({ dateCreated: -1 })
      .lean()
          .maxTimeMS(500);
      },
      [cacheKey],
      {
        tags: ['projects'],
        revalidate: 300, // 5 minutes
      }
    );

    const projects = await getCachedProjects();
    
    // Use ETag for conditional requests (304 Not Modified)
    return createETagResponse(
      { projects },
      request,
      {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=60",
      }
    );
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    const project = await Project.create(data);
    
    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('projects');
    
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}

