import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Blog from "@/models/Blog";

/**
 * Auto-publish scheduled blog posts
 * This should be called periodically (via cron job or scheduled task)
 * to automatically publish posts when their scheduled date arrives
 */
export async function POST(request: Request) {
  try {
    // Optional: Add API key or authentication for security
    const authHeader = request.headers.get("authorization");
    const expectedKey = process.env.AUTO_PUBLISH_API_KEY;
    
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const now = new Date();
    
    // Find all scheduled posts that should be published now
    const scheduledPosts = await Blog.find({
      published: false,
      publishedDate: { $lte: now },
    });

    let publishedCount = 0;

    for (const post of scheduledPosts) {
      post.published = true;
      await post.save();
      publishedCount++;
    }

    // Revalidate blog pages
    if (publishedCount > 0) {
    }

    return NextResponse.json({
      success: true,
      published: publishedCount,
      message: `Published ${publishedCount} scheduled post(s)`,
    });
  } catch (error) {
    console.error("Error auto-publishing blogs:", error);
    return NextResponse.json(
      { error: "Failed to auto-publish blogs" },
      { status: 500 }
    );
  }
}

