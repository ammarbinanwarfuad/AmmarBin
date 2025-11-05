import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { fetchGitHubRepos } from "@/lib/github";

export async function GET() {
  try {
    await connectDB();
    const Blog = (await import("@/models/Blog")).default;
    const Message = (await import("@/models/Message")).default;

    const username = process.env.GITHUB_USERNAME || "";
    
    // Fetch GitHub repos with timeout
    let repos: Awaited<ReturnType<typeof fetchGitHubRepos>> = [];
    const fetchReposWithTimeout = username 
      ? Promise.race([
          fetchGitHubRepos(username).then((r) => r.slice(0, 5)),
          new Promise<[]>(resolve => setTimeout(() => resolve([]), 10000)),
        ])
      : Promise.resolve([]);
    repos = await fetchReposWithTimeout;

    const [blogs, messages] = await Promise.all([
      Blog.find({}).select('title slug updatedAt').sort({ updatedAt: -1 }).limit(5).lean().maxTimeMS(500),
      Message.find({}).select('name email subject createdAt').sort({ createdAt: -1 }).limit(5).lean().maxTimeMS(500),
    ]);

    return NextResponse.json(
      { blogs, messages, repos },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to load recent" }, { status: 500 });
  }
}


