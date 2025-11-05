import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ExternalBlog from "@/models/ExternalBlog";
import { fetchHashnodePosts, fetchGUCCPosts } from "@/lib/blog-fetchers";
import { logActivity } from "@/lib/activity-logger";

export async function POST(request: Request) {
  try {
    await connectDB();

    const username = process.env.HASHNODE_USERNAME || "ammarbin";
    const blogUrlEnv = process.env.HASHNODE_BLOG_URL || `${username}.hashnode.dev`;
    console.log(`Syncing blogs for Hashnode user: ${username}, blog URL: ${blogUrlEnv}`);

    // Fetch from both sources
    const [hashnodePosts, guccPosts] = await Promise.all([
      fetchHashnodePosts(username),
      fetchGUCCPosts(),
    ]);

    console.log(`Fetched ${hashnodePosts.length} Hashnode posts and ${guccPosts.length} GUCC posts`);

    const allPosts = [...hashnodePosts, ...guccPosts];

    // Upsert posts to database
    let syncedCount = 0;
    for (const post of allPosts) {
      try {
        await ExternalBlog.findOneAndUpdate(
          { url: post.url },
          { ...post, lastFetched: new Date() },
          { upsert: true, new: true }
        );
        syncedCount++;
        console.log(`Synced: ${post.title} (${post.url})`);
      } catch (error) {
        console.error(`Error syncing post ${post.title}:`, error);
      }
    }

    console.log(`Successfully synced ${syncedCount} out of ${allPosts.length} posts`);

    // Log activity
    await logActivity({
      action: "sync",
      entityType: "blogs",
      entityId: "external-sync",
      entityTitle: "External Blogs Sync",
      metadata: {
        count: allPosts.length,
        sources: {
          hashnode: hashnodePosts.length,
          gucc: guccPosts.length,
        },
      },
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    // Revalidate server-side cache

    return NextResponse.json({
      message: "Blogs synced successfully",
      count: allPosts.length,
      sources: {
        hashnode: hashnodePosts.length,
        gucc: guccPosts.length,
      },
      debug: {
        blogUrl: blogUrlEnv,
        username,
      },
    });
  } catch (error) {
    console.error("Error syncing blogs:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to sync blogs",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

