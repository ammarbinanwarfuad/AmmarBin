import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { createETagResponse } from "@/lib/etag";
import { getCached, getCacheKey, CACHE_TTL, invalidateCache } from "@/lib/redis-cache";

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

    // ✅ OPTIMIZED: Redis caching (10-minute cache)
    const redisCacheKey = getCacheKey(
      'projects',
      session ? 'admin' : 'public',
      category || 'all',
      featured || 'all',
      topicsParam || 'all'
    );
    
    const data = await getCached(
      redisCacheKey,
      async () => {
        await connectDB();
        const projects = await Project.find(query)
          .select('_id title slug description published featured dateCreated techStack topics thumbnail category image liveUrl githubUrl videoUrl languages')
          .sort({ dateCreated: -1 })
          .lean()
          .maxTimeMS(500);
        return { projects };
      },
      CACHE_TTL.PROJECTS
    );
    
    // Use ETag for conditional requests (304 Not Modified)
    return createETagResponse(
      data,
      request,
      {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
        "CDN-Cache-Control": "public, s-maxage=600",
        "X-Cache-Key": redisCacheKey,
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.description) {
      return NextResponse.json(
        { error: "Title and description are required", message: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Auto-generate slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Ensure unique slug
      let slugExists = await Project.findOne({ slug: data.slug });
      let counter = 1;
      const baseSlug = data.slug;
      while (slugExists) {
        data.slug = `${baseSlug}-${counter}`;
        slugExists = await Project.findOne({ slug: data.slug });
        counter++;
      }
    }
    
    const project = await Project.create(data);
    
    // ✅ OPTIMIZED: Invalidate both Next.js and Redis cache
    invalidateCacheAfterUpdate('projects');
    await invalidateCache('projects:*');
    
    return NextResponse.json({ project, message: "Project created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

