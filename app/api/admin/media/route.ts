import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import { cachedFetch, invalidateCache } from "@/lib/cache";

// ⚡ Performance: Cache media list for 5 minutes


export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");
    const maxResults = parseInt(searchParams.get("maxResults") || "100");
    const resourceType = searchParams.get("resourceType");

    // Create cache key based on parameters
    const cacheKey = `admin:media:${resourceType || 'all'}:${folder || 'none'}:${search || 'none'}:${maxResults}`;
    
    // Cache media list for 5 minutes (media doesn't change frequently)
    const data = await cachedFetch(
      cacheKey,
      async () => {
        // If no resourceType or "all", fetch all types and combine
        const resourceTypes = resourceType && resourceType !== "all" 
          ? [resourceType] 
          : ["image", "video", "raw"];

        if (search) {
          // Cloudinary search API
          try {
            const searchExpression = folder 
              ? `folder:${folder} AND ${search}`
              : search;
            
            const searchResult = await cloudinary.search
              .expression(searchExpression)
              .with_field("context")
              .sort_by("created_at", "desc")
              .max_results(maxResults)
              .execute();
            
            return {
              resources: searchResult.resources || [],
              total: searchResult.total_count || 0,
            };
          } catch (searchError) {
            console.error("Search error:", searchError);
            // Fall back to list if search fails
          }
        }

        // ⚡ Performance: Fetch all resource types in parallel instead of sequential
        const fetchPromises = resourceTypes.map(async (type) => {
          const options: Record<string, unknown> = {
            type: "upload",
            resource_type: type,
            max_results: maxResults,
          };

          // Only add folder prefix if specified
          if (folder) {
            options.prefix = folder;
          }

          try {
            const result = await cloudinary.api.resources(options);
            return {
              resources: result.resources || [],
              total: result.total_count || 0,
            };
          } catch (typeError) {
            console.error(`Error fetching ${type} resources:`, typeError);
            return { resources: [], total: 0 };
          }
        });

        const results = await Promise.all(fetchPromises);
        
        // Combine all resources
        const allResources: Array<Record<string, unknown>> = [];
        let totalCount = 0;
        
        for (const result of results) {
          allResources.push(...result.resources);
          totalCount += result.total;
        }

        // Sort all resources by created_at descending
        allResources.sort((a, b) => {
          const dateA = new Date((a.created_at as string) || 0).getTime();
          const dateB = new Date((b.created_at as string) || 0).getTime();
          return dateB - dateA;
        });

        // Limit to maxResults if fetching all types
        const limitedResources = resourceTypes.length > 1 
          ? allResources.slice(0, maxResults)
          : allResources;

        return {
          resources: limitedResources,
          total: resourceTypes.length > 1 ? allResources.length : totalCount,
        };
      },
      5 * 60 * 1000 // 5 minutes TTL
    );

    return NextResponse.json(
      data,
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching media:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch media", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");
    const resourceType = searchParams.get("resourceType") || "image";

    if (!publicId) {
      return NextResponse.json(
        { error: "publicId is required" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    // Invalidate media cache after deletion
    invalidateCache(`admin:media:${resourceType}:*`);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}

