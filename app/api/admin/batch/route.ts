import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { cachedFetch } from "@/lib/cache";

// Vercel serverless optimization
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;
export const preferredRegion = 'sin1'; // Singapore - closest to Mumbai MongoDB

/**
 * Batch API endpoint for admin dashboard
 * Fetches multiple data sources in parallel to reduce total request time
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoints = searchParams.get("endpoints")?.split(",") || [
      "analytics",
      "system",
    ];
    
    // ✅ OPTIMIZED: Add timeout to prevent hanging
    const ENDPOINT_TIMEOUT = 3000; // 3 seconds max per endpoint

    // Fetch all requested endpoints in parallel with timeout
    const results = await Promise.allSettled(
      endpoints.map(async (endpoint) => {
        // Add timeout wrapper for each endpoint
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Endpoint timeout')), ENDPOINT_TIMEOUT)
        );
        
        const endpointPromise = (async () => {
          switch (endpoint.trim()) {
          case "analytics": {
            return cachedFetch(
              "admin:analytics",
              async () => {
                await connectDB();
                const Project = (await import("@/models/Project")).default;
                const Blog = (await import("@/models/Blog")).default;
                const Message = (await import("@/models/Message")).default;
                const Skill = (await import("@/models/Skill")).default;

                const now = new Date();
                const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

                const [
                  projects,
                  blogs,
                  messages,
                  skills,
                  p7,
                  b7,
                  m7,
                  s7,
                  p30,
                  b30,
                  m30,
                  s30,
                ] = await Promise.all([
                  Project.countDocuments({}).maxTimeMS(300),
                  Blog.countDocuments({}).maxTimeMS(300),
                  Message.countDocuments({}).maxTimeMS(300),
                  Skill.countDocuments({}).maxTimeMS(300),
                  Project.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(300),
                  Blog.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(300),
                  Message.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(300),
                  Skill.countDocuments({ createdAt: { $gte: d7 } }).maxTimeMS(300),
                  Project.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(300),
                  Blog.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(300),
                  Message.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(300),
                  Skill.countDocuments({ createdAt: { $gte: d30 } }).maxTimeMS(300),
                ]);

                return {
                  totals: { projects, blogs, messages, skills },
                  last7d: { projects: p7, blogs: b7, messages: m7, skills: s7 },
                  last30d: { projects: p30, blogs: b30, messages: m30, skills: s30 },
                  generatedAt: now.toISOString(),
                };
              },
              2 * 60 * 1000 // Reduced from 5min to 2min for faster updates
            );
          }
          case "recent": {
            return cachedFetch(
              "admin:recent",
              async () => {
                await connectDB();
                const Blog = (await import("@/models/Blog")).default;
                const Message = (await import("@/models/Message")).default;
                const { fetchGitHubRepos } = await import("@/lib/github");

                const username = process.env.GITHUB_USERNAME || "";
                let repos: Awaited<ReturnType<typeof fetchGitHubRepos>> = [];
                if (username) {
                  repos = await Promise.race([
                    fetchGitHubRepos(username).then((r) => r.slice(0, 5)),
                    new Promise<[]>(resolve => setTimeout(() => resolve([]), 10000)),
                  ]);
                }

                const [blogs, messages] = await Promise.all([
                  Blog.find({})
                    .select("title slug updatedAt")
                    .sort({ updatedAt: -1 })
                    .limit(5)
                    .lean()
                    .maxTimeMS(500),
                  Message.find({})
                    .select("name email subject createdAt")
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .lean()
                    .maxTimeMS(500),
                ]);

                return { blogs, messages, repos };
              },
              2 * 60 * 1000
            );
          }
          case "links": {
            // Return empty for now - link check is expensive and should be separate
            return { results: [], broken: [] };
          }
          case "seo": {
            // Return basic SEO info
            return { issues: [], warnings: [] };
          }
          case "system": {
            return {
              nodeVersion: process.version,
              platform: process.platform,
              uptime: process.uptime(),
            };
          }
            default:
              return null;
          }
        })();
        
        return Promise.race([endpointPromise, timeoutPromise]);
      })
    );

    // Build response object
    const response: Record<string, unknown> = {};
    endpoints.forEach((endpoint, index) => {
      const result = results[index];
      if (result.status === "fulfilled") {
        response[endpoint.trim()] = result.value;
      } else {
        response[endpoint.trim()] = { error: "Failed to fetch" };
      }
    });

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    console.error("Error in batch endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch data" },
      { status: 500 }
    );
  }
}

