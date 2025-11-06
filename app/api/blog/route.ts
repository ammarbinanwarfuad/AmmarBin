import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";
import ExternalBlog from "@/models/ExternalBlog";
import { invalidateCacheAfterUpdate } from "@/lib/cache-invalidation";
import { unstable_cache } from "next/cache";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const slug = searchParams.get("slug");
    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    // If slug is provided, fetch single blog post
    if (slug) {
      const getCachedBlog = unstable_cache(
        async () => {
          await connectDB();
          return await Blog.findOne({ slug })
        .lean()
            .maxTimeMS(500);
        },
        [`blog:${slug}`],
        {
          tags: ['blog'],
          revalidate: 300, // 5 minutes
        }
      );

      const blog = await getCachedBlog();
      
      if (!blog) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { blog },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
            "CDN-Cache-Control": "public, s-maxage=60",
          },
        }
      );
    }

    // Create cache key based on query parameters
    const cacheKey = `blogs:${source || 'all'}:${includeUnpublished}`;

    // Use unstable_cache for server-side caching
    const getCachedBlogs = unstable_cache(
      async () => {
        await connectDB();

    // Fetch internal blogs
    let internalBlogs: Record<string, unknown>[] = [];
    if (!source || source === "internal") {
      const query = includeUnpublished ? {} : { published: true };
      internalBlogs = await Blog.find(query)
        .sort({ publishedDate: -1, createdAt: -1 })
        .lean()
            .maxTimeMS(500);
    }

    // Fetch external blogs
    let externalBlogs: Record<string, unknown>[] = [];
    if (!source || source !== "internal") {
      const query = source ? { source } : {};
      externalBlogs = await ExternalBlog.find(query)
        .sort({ publishedDate: -1 })
        .lean()
            .maxTimeMS(500);
    }

    // Combine and add source field
        return [
      ...internalBlogs.map((blog) => ({ ...blog, source: "internal" as const })),
      ...externalBlogs.map((blog) => ({ 
        ...blog, 
        source: (blog.source as string) || "external",
            published: true
      })),
    ].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const dateA = new Date((a.publishedDate as string) || (a.createdAt as string));
      const dateB = new Date((b.publishedDate as string) || (b.createdAt as string));
      return dateB.getTime() - dateA.getTime();
    });
      },
      [cacheKey],
      {
        tags: ['blog'],
        revalidate: 300, // 5 minutes
      }
    );

    const allBlogs = await getCachedBlogs();

    return NextResponse.json(
      { blogs: allBlogs },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "CDN-Cache-Control": "public, s-maxage=60",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // Handle scheduling logic
    if (data.publishedDate) {
      const scheduledDate = new Date(data.publishedDate);
      const now = new Date();
      
      // If scheduled for future and not explicitly published, keep as draft
      if (scheduledDate > now && !data.published) {
        data.published = false;
      } else if (scheduledDate <= now) {
        // If scheduled date has passed, auto-publish
        data.published = true;
      }
    }
    
    const blog = await Blog.create(data);
    
    // Invalidate cache (non-blocking, fire-and-forget)
    invalidateCacheAfterUpdate('blog');
    
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

